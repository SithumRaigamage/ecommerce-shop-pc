import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CATEGORY_SPEC_FIELDS, validateCatalogue } from './catalogue-schema'
import { CATEGORIES } from './categories'
import type { Product } from '@/types'

const catalogue: Product[] = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public/assets/json/products.json'), 'utf8'),
)

function make(overrides: Partial<Product> = {}): Product {
  return {
    id: 'x',
    title: 'X',
    brand: 'ACME',
    mpn: 'MPN-X',
    price: 100,
    category: 'processor',
    image: null,
    specs: { socket: 'AM5', cores: 8, threads: 16, tdp: 120 },
    ...overrides,
  }
}

describe('validateCatalogue', () => {
  it('passes the committed catalogue', () => {
    expect(validateCatalogue(catalogue)).toEqual([])
  })

  it('flags an empty catalogue', () => {
    expect(validateCatalogue([])).toHaveLength(1)
  })

  it('flags a missing category-required spec', () => {
    const issues = validateCatalogue([make({ specs: { socket: 'AM5', cores: 8, threads: 16 } })])
    expect(issues).toHaveLength(1)
    expect(issues[0].problem).toContain('missing spec "tdp"')
  })

  it('flags a missing top-level field', () => {
    const issues = validateCatalogue([make({ brand: '' })])
    expect(issues.some((i) => i.problem.includes('"brand"'))).toBe(true)
  })

  it('flags a null or non-positive price', () => {
    expect(validateCatalogue([make({ price: null as unknown as number })]).length).toBeGreaterThan(0)
    expect(validateCatalogue([make({ price: 0 })]).length).toBeGreaterThan(0)
  })

  it('flags an unknown category', () => {
    const issues = validateCatalogue([make({ category: 'widgets' })])
    expect(issues[0].problem).toContain('unknown category')
  })

  it('flags duplicate ids', () => {
    const issues = validateCatalogue([make(), make()])
    expect(issues.some((i) => i.problem === 'duplicate id')).toBe(true)
  })

  it('accepts a null image', () => {
    expect(validateCatalogue([make({ image: null })])).toEqual([])
  })

  it('treats an empty array spec as missing', () => {
    const issues = validateCatalogue([
      make({
        category: 'cases',
        specs: { max_gpu_mm: 400, max_cooler_mm: 170, form_factors: [] },
      }),
    ])
    expect(issues[0].problem).toContain('form_factors')
  })
})

describe('schema and navigation agree', () => {
  it('defines spec fields for exactly the navigable categories', () => {
    expect(Object.keys(CATEGORY_SPEC_FIELDS).sort()).toEqual(CATEGORIES.map((c) => c.slug).sort())
  })
})
