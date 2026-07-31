import { normalizeCategory } from '@/lib/categories'
import type { Product } from '@/types'

/**
 * The scraped catalogue reuses ids across categories — `"1"` is both the
 * PlayStation 5 and a set of NZXT speakers. That breaks three things:
 *
 *   - `getProductById` resolves to whichever entry came first, so the shadowed
 *     products have no reachable detail page;
 *   - the cart merges quantities by product id, so unrelated items collide;
 *   - React list keys are no longer unique.
 *
 * Ids appear in URLs, so the fix has to be deterministic and stable: the first
 * occurrence keeps the bare id (existing links keep working) and each later
 * collision is suffixed with its category. Order comes from the JSON file, which
 * the scraper writes deterministically.
 */
export function dedupeProductIds(products: Product[]): Product[] {
  const seen = new Map<string, number>()

  return products.map((product) => {
    const count = seen.get(product.id) ?? 0
    seen.set(product.id, count + 1)

    if (count === 0) return product

    const suffix = normalizeCategory(product.category) || `dup${count}`
    let id = `${product.id}-${suffix}`

    // A category could itself repeat within one duplicated id; keep widening.
    let attempt = 2
    while (seen.has(id)) {
      id = `${product.id}-${suffix}-${attempt}`
      attempt += 1
    }
    seen.set(id, 1)

    return { ...product, id }
  })
}

/**
 * A handful of scraped rows carry `price: null` (the source page showed no
 * price). They can't be filtered on, priced, or added to a cart, and a null
 * price compares as 0 — so they would surface as free products at the top of
 * the price filter. Drop them rather than render something untruthful.
 */
export function isSellable(product: Product): boolean {
  return (
    typeof product.price === 'number' &&
    Number.isFinite(product.price) &&
    product.price > 0 &&
    Boolean(product.title) &&
    Boolean(product.image)
  )
}

/**
 * Single entry point that turns raw scraper output into the catalogue the app
 * works with. Order matters: normalise categories first (dedupe suffixes are
 * derived from them), then drop unsellable rows, then assign unique ids.
 */
export function normalizeCatalogue(raw: Product[]): Product[] {
  const withCategories = raw.map((product) => ({
    ...product,
    category: normalizeCategory(product.category),
  }))
  return dedupeProductIds(withCategories.filter(isSellable))
}
