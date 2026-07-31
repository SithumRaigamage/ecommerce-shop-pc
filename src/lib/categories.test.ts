import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CATEGORIES, categoryLabel, normalizeCategory } from './categories'
import type { Product } from '@/types'

const products: Product[] = JSON.parse(
  readFileSync(resolve(process.cwd(), 'public/assets/json/products.json'), 'utf8'),
)

const slugs = CATEGORIES.map((c) => c.slug)
const catalogueSlugs = new Set(products.map((p) => normalizeCategory(p.category)))

describe('normalizeCategory', () => {
  it('lowercases and trims', () => {
    expect(normalizeCategory('Laptop')).toBe('laptop')
    expect(normalizeCategory('  storage ')).toBe('storage')
  })

  it('resolves the scraper aliases onto canonical slugs', () => {
    expect(normalizeCategory('speakers,')).toBe('audio')
    expect(normalizeCategory('casings')).toBe('cases')
    expect(normalizeCategory('television')).toBe('tv')
    expect(normalizeCategory('expansion')).toBe('networking')
    expect(normalizeCategory('external')).toBe('external-storage')
    expect(normalizeCategory('console')).toBe('gaming')
    expect(normalizeCategory('apple')).toBe('laptop')
    expect(normalizeCategory('os')).toBe('software')
    expect(normalizeCategory('live')).toBe('streaming')
  })

  it('returns an empty string for missing values', () => {
    expect(normalizeCategory(undefined)).toBe('')
    expect(normalizeCategory('')).toBe('')
  })
})

describe('category definitions', () => {
  it('has unique slugs', () => {
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('exposes a label for each slug', () => {
    for (const { slug, label } of CATEGORIES) {
      expect(categoryLabel(slug)).toBe(label)
    }
  })
})

/**
 * These two guard the fix: if `Web_Scraper/` introduces a new category value, or
 * a category empties out, the navigation silently loses coverage. Fail loudly
 * instead — add an alias or a CATEGORIES entry.
 */
describe('catalogue coverage', () => {
  it('has a navigable category for every product in the catalogue', () => {
    const unreachable = [...catalogueSlugs].filter((slug) => !slugs.includes(slug))
    expect(unreachable).toEqual([])
  })

  it('has at least one product behind every navigable category', () => {
    const empty = slugs.filter((slug) => !catalogueSlugs.has(slug))
    expect(empty).toEqual([])
  })
})
