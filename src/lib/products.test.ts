import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { dedupeProductIds, isSellable, normalizeCatalogue } from './products'
import type { Product } from '@/types'

const raw: Product[] = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public/assets/json/products.json'), 'utf8'),
)

const catalogue = normalizeCatalogue(raw)

function product(id: string, category: string, title = id): Product {
  return { id, title, brand: 'ACME', mpn: `MPN-${id}`, price: 1, image: null, category, specs: {} }
}

describe('dedupeProductIds', () => {
  it('leaves an already-unique catalogue untouched', () => {
    const input = [product('a', 'gaming'), product('b', 'storage')]
    expect(dedupeProductIds(input).map((p) => p.id)).toEqual(['a', 'b'])
  })

  it('keeps the bare id on the first occurrence so existing URLs still resolve', () => {
    const input = [product('1', 'gaming'), product('1', 'audio')]
    expect(dedupeProductIds(input)[0].id).toBe('1')
  })

  it('suffixes later collisions with their category', () => {
    const input = [product('1', 'gaming'), product('1', 'audio')]
    expect(dedupeProductIds(input)[1].id).toBe('1-audio')
  })

  it('widens the suffix when a category repeats within one id', () => {
    const input = [product('1', 'audio'), product('1', 'audio'), product('1', 'audio')]
    expect(dedupeProductIds(input).map((p) => p.id)).toEqual(['1', '1-audio', '1-audio-2'])
  })

  it('is deterministic across runs', () => {
    expect(dedupeProductIds(raw).map((p) => p.id)).toEqual(dedupeProductIds(raw).map((p) => p.id))
  })

  it('preserves every product', () => {
    expect(dedupeProductIds(raw)).toHaveLength(raw.length)
  })
})

describe('isSellable', () => {
  it('rejects a null or missing price', () => {
    const unpriced = { ...product('a', 'processor'), price: null as unknown as number }
    expect(isSellable(unpriced)).toBe(false)
  })

  it('rejects zero and negative prices', () => {
    expect(isSellable({ ...product('a', 'processor'), price: 0 })).toBe(false)
    expect(isSellable({ ...product('a', 'processor'), price: -5 })).toBe(false)
  })

  it('accepts a product whose image is null, since imagery is not sourced yet', () => {
    expect(isSellable({ ...product('a', 'processor'), price: 100, image: null })).toBe(true)
  })

  it('keeps every product in the curated catalogue', () => {
    expect(raw.every(isSellable)).toBe(true)
  })
})

describe('catalogue integrity', () => {
  it('yields a unique id for every product', () => {
    const ids = catalogue.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('makes every product reachable by its own id', () => {
    for (const item of catalogue) {
      const found = catalogue.find((p) => p.id === item.id)
      expect(found?.title).toBe(item.title)
    }
  })

  it('gives every product a title, brand, mpn and numeric price', () => {
    const broken = catalogue.filter(
      (p) => !p.title || !p.brand || !p.mpn || typeof p.price !== 'number',
    )
    expect(broken.map((p) => p.id)).toEqual([])
  })
})
