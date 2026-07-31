import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CATEGORIES, normalizeCategory } from './categories'
import { normalizeCatalogue } from './products'
import { isKnownRoute } from '@/routes'
import type { Banner, Category, FeaturedProduct, Product } from '@/types'

const read = <T>(name: string): T =>
  JSON.parse(readFileSync(resolve(process.cwd(), `public/assets/json/${name}`), 'utf8'))

const banners = read<Banner[]>('banner.json')
const featured = read<FeaturedProduct[]>('featuredProducts.json')
const homeCategories = read<Category[]>('categories.json')
const catalogue = normalizeCatalogue(read<Product[]>('products.json'))

const catalogueIds = new Set(catalogue.map((p) => p.id))
const categorySlugs = new Set(CATEGORIES.map((c) => c.slug))

/**
 * The Angular app shipped banners pointing at `/category/workstations` and
 * featured products linking to `/category/product/:id` — neither route existed,
 * so both dead-ended. These tests fail if a fixture ever points somewhere the
 * router cannot resolve again.
 */
describe('banner.json', () => {
  it('is not empty', () => {
    expect(banners.length).toBeGreaterThan(0)
  })

  it.each(banners.map((b, i) => [i, b] as const))(
    'banner %i has every field the carousel renders',
    (_i, banner) => {
      expect(banner.id).toBeTypeOf('number')
      expect(banner.title).toBeTruthy()
      expect(banner.subtitle).toBeTruthy()
      expect(banner.buttonText).toBeTruthy()
      expect(banner.image).toBeTruthy()
      expect(banner.backgroundColor).toBeTruthy()
      expect(banner.category).toBeTypeOf('string')
    },
  )

  it('has unique ids', () => {
    const ids = banners.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('links only to routes the router knows', () => {
    const dead = banners.filter((b) => !isKnownRoute(b.buttonLink))
    expect(dead.map((b) => `${b.title} -> ${b.buttonLink}`)).toEqual([])
  })

  it('filters only on categories that exist and have products', () => {
    const bad = banners
      .filter((b) => b.category !== '')
      .filter((b) => !categorySlugs.has(normalizeCategory(b.category)))
    expect(bad.map((b) => `${b.title} -> ${b.category}`)).toEqual([])
  })
})

describe('featuredProducts.json', () => {
  it('is not empty', () => {
    expect(featured.length).toBeGreaterThan(0)
  })

  it('promotes products that exist in the catalogue', () => {
    const missing = featured.filter((f) => !catalogueIds.has(f.productId))
    expect(missing.map((f) => `${f.name} -> ${f.productId}`)).toEqual([])
  })

  it('does not repeat the same product', () => {
    const ids = featured.map((f) => f.productId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('matches the catalogue price and title it promotes', () => {
    for (const item of featured) {
      const product = catalogue.find((p) => p.id === item.productId)
      expect(product?.title).toBe(item.name)
      expect(product?.price).toBe(item.price)
    }
  })

  it('shows a discount only when there is one', () => {
    const wrong = featured.filter((f) => f.oldPrice !== undefined && f.oldPrice <= f.price)
    expect(wrong.map((f) => f.name)).toEqual([])
  })

  it('uses categories that exist', () => {
    const bad = featured.filter((f) => !categorySlugs.has(normalizeCategory(f.category)))
    expect(bad.map((f) => `${f.name} -> ${f.category}`)).toEqual([])
  })

  /**
   * Imagery is sourced in a later stage, so `image` is null for now. What must
   * not happen is a hotlink to a third-party URL (the previous catalogue's
   * images all 404'd) or a path to a file that isn't committed.
   */
  it('never hotlinks a remote image, and any local path exists', () => {
    const broken = featured.filter((f) => {
      if (f.image === null) return false
      if (/^https?:/.test(f.image)) return true
      return !existsSync(resolve(process.cwd(), 'public', f.image.replace(/^\//, '')))
    })
    expect(broken.map((f) => `${f.name} -> ${f.image}`)).toEqual([])
  })
})

describe('categories.json (home page tiles)', () => {
  it('links every tile to a category that has products', () => {
    const bad = homeCategories.filter((c) => !categorySlugs.has(normalizeCategory(c.slug)))
    expect(bad.map((c) => `${c.name} -> ${c.slug}`)).toEqual([])
  })
})
