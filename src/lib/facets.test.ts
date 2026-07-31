import { describe, expect, it } from 'vitest'
import {
  CATALOGUE_FACETS,
  numberFacet,
  readFacets,
  stringFacet,
  stringListFacet,
  writeFacets,
} from './facets'

const params = (query: string) => new URLSearchParams(query)

describe('readFacets', () => {
  it('parses declared facets from the query string', () => {
    const values = readFacets(CATALOGUE_FACETS, params('category=graphics&maxPrice=50000'))
    expect(values).toEqual({ category: 'graphics', maxPrice: 50000 })
  })

  it('falls back when params are absent', () => {
    expect(readFacets(CATALOGUE_FACETS, params(''))).toEqual({ category: '', maxPrice: null })
  })

  it('falls back when a numeric param is not a number', () => {
    expect(readFacets(CATALOGUE_FACETS, params('maxPrice=abc')).maxPrice).toBeNull()
  })

  it('ignores query keys it does not own', () => {
    const values = readFacets(CATALOGUE_FACETS, params('utm_source=x&category=memory'))
    expect(values.category).toBe('memory')
  })
})

describe('writeFacets', () => {
  it('sets a facet', () => {
    const next = writeFacets(CATALOGUE_FACETS, params(''), { category: 'cases' })
    expect(next.get('category')).toBe('cases')
  })

  it('omits values equal to the fallback so defaults stay out of the URL', () => {
    const next = writeFacets(CATALOGUE_FACETS, params('category=cases'), { category: '' })
    expect(next.has('category')).toBe(false)
  })

  it('drops a null number rather than writing "null"', () => {
    const next = writeFacets(CATALOGUE_FACETS, params('maxPrice=900'), { maxPrice: null })
    expect(next.has('maxPrice')).toBe(false)
  })

  it('preserves unrelated params', () => {
    const next = writeFacets(CATALOGUE_FACETS, params('utm_source=x'), { maxPrice: 1000 })
    expect(next.get('utm_source')).toBe('x')
    expect(next.get('maxPrice')).toBe('1000')
  })

  it('leaves facets absent from the update untouched', () => {
    const next = writeFacets(CATALOGUE_FACETS, params('category=memory'), { maxPrice: 500 })
    expect(next.get('category')).toBe('memory')
  })

  it('round-trips through read', () => {
    const written = writeFacets(CATALOGUE_FACETS, params(''), {
      category: 'storage',
      maxPrice: 42000,
    })
    expect(readFacets(CATALOGUE_FACETS, written)).toEqual({
      category: 'storage',
      maxPrice: 42000,
    })
  })
})

/** Adding a facet must not require touching consumers — only the schema. */
describe('extensibility', () => {
  const EXTENDED = {
    ...CATALOGUE_FACETS,
    brand: stringListFacet('brand'),
    socket: stringFacet('socket'),
    sort: stringFacet('sort', 'relevance'),
  } as const

  it('reads and writes facets added to the schema', () => {
    const written = writeFacets(EXTENDED, params('category=processor'), {
      brand: ['AMD', 'Intel'],
      socket: 'AM5',
      sort: 'price-asc',
    })
    expect(written.get('brand')).toBe('AMD,Intel')

    const values = readFacets(EXTENDED, written)
    expect(values).toEqual({
      category: 'processor',
      maxPrice: null,
      brand: ['AMD', 'Intel'],
      socket: 'AM5',
      sort: 'price-asc',
    })
  })

  it('omits a list facet when empty and a sort equal to its default', () => {
    const next = writeFacets(EXTENDED, params('brand=AMD&sort=price-asc'), {
      brand: [],
      sort: 'relevance',
    })
    expect(next.has('brand')).toBe(false)
    expect(next.has('sort')).toBe(false)
  })
})

describe('codecs', () => {
  it('numberFacet honours a custom fallback', () => {
    const codec = numberFacet('n', 10)
    expect(codec.parse(null)).toBe(10)
    expect(codec.serialize(10)).toBeNull()
    expect(codec.serialize(11)).toBe('11')
  })

  it('stringListFacet drops empty segments', () => {
    expect(stringListFacet('b').parse('AMD,,Intel')).toEqual(['AMD', 'Intel'])
  })
})
