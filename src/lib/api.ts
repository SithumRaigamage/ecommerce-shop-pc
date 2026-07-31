import { normalizeCategory } from '@/lib/categories'
import { normalizeCatalogue } from '@/lib/products'
import type {
  Banner,
  Category,
  FeaturedProduct,
  FilterOptions,
  Product,
} from '@/types'

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with ${res.status}`)
  }
  return (await res.json()) as T
}

/**
 * The Angular services re-fetched products.json for every lookup. Memoising the
 * promise keeps the same API shape while doing a single network round trip.
 */
const cache = new Map<string, Promise<unknown>>()

function getJsonCached<T>(url: string): Promise<T> {
  let pending = cache.get(url) as Promise<T> | undefined
  if (!pending) {
    pending = getJson<T>(url).catch((err) => {
      cache.delete(url)
      throw err
    })
    cache.set(url, pending)
  }
  return pending
}

const PRODUCTS_URL = '/assets/json/products.json'
const FILTERS_URL = '/assets/json/filters.json'

export const getBanners = () => getJsonCached<Banner[]>('/assets/json/banner.json')

export const getFeaturedProducts = () =>
  getJsonCached<FeaturedProduct[]>('/assets/json/featuredProducts.json')

export const getCategories = () =>
  getJsonCached<Category[]>('/assets/json/categories.json')

/**
 * Catalogue reads go through here so every consumer sees canonical category
 * slugs, regardless of how the scraper spelled them.
 */
let normalizedProducts: Promise<Product[]> | undefined

export function getAllProducts(): Promise<Product[]> {
  normalizedProducts ??= getJsonCached<Product[]>(PRODUCTS_URL)
    .then(normalizeCatalogue)
    .catch((err) => {
      normalizedProducts = undefined
      throw err
    })
  return normalizedProducts
}

export async function getProductCategories(): Promise<string[]> {
  const products = await getAllProducts()
  return Array.from(new Set(products.map((p) => p.category)))
}

export async function getProductsByCategory(category?: string | null): Promise<Product[]> {
  const products = await getAllProducts()
  if (!category) return products
  const slug = normalizeCategory(category)
  return products.filter((p) => p.category === slug)
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getAllProducts()
  return products.find((p) => p.id === id)
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const data = await getJsonCached<{ filters: FilterOptions }>(FILTERS_URL)
  return data.filters
}
