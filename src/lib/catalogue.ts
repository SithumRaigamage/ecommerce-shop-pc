import { CATEGORY_SPEC_FIELDS } from '@/lib/catalogue-schema'
import { categoryLabel } from '@/lib/categories'
import { formatLKR } from '@/lib/format'
import type { CatalogueFacetValues } from '@/lib/facets'
import type { Product } from '@/types'

/* ------------------------------------------------------------------ specs */

/** Units, so figures carry their dimension wherever they are rendered. */
export const SPEC_UNITS: Record<string, string> = {
  tdp: 'W',
  vram_gb: 'GB',
  length_mm: 'mm',
  wattage: 'W',
  speed: 'MT/s',
  read_mbs: 'MB/s',
  size: '"',
  refresh: 'Hz',
  max_gpu_mm: 'mm',
  max_cooler_mm: 'mm',
  cas: 'CL',
}

export const SPEC_LABELS: Record<string, string> = {
  socket: 'Socket',
  cores: 'Cores',
  threads: 'Threads',
  tdp: 'TDP',
  vram_gb: 'VRAM',
  length_mm: 'Length',
  chipset: 'Chipset',
  form_factor: 'Form factor',
  form_factors: 'Fits',
  ram_slots: 'RAM slots',
  type: 'Type',
  speed: 'Speed',
  cas: 'CAS',
  capacity: 'Capacity',
  wattage: 'Wattage',
  efficiency: 'Efficiency',
  modular: 'Modular',
  max_gpu_mm: 'Max GPU',
  max_cooler_mm: 'Max cooler',
  interface: 'Interface',
  read_mbs: 'Read',
  size: 'Size',
  resolution: 'Resolution',
  refresh: 'Refresh',
  panel: 'Panel',
}

export const specLabel = (key: string) =>
  SPEC_LABELS[key] ?? key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())

/**
 * The two specs that actually decide a purchase in each category — what goes on
 * the card. Not the first two in the schema: for a PSU the wattage and the
 * efficiency rating decide it, the modularity does not.
 */
export const HEADLINE_SPECS: Record<string, readonly string[]> = {
  processor: ['cores', 'socket'],
  graphics: ['vram_gb', 'tdp'],
  motherboards: ['socket', 'form_factor'],
  memory: ['capacity', 'speed'],
  storage: ['capacity', 'read_mbs'],
  power: ['wattage', 'efficiency'],
  cases: ['max_gpu_mm', 'form_factors'],
  monitors: ['size', 'refresh'],
}

/**
 * Spec keys offered as filters per category. Only enumerable specs qualify —
 * filtering on a continuous value (TDP, length) needs a range control, which
 * the rail does not have yet.
 */
export const SPEC_FACETS: Record<string, readonly string[]> = {
  processor: ['socket'],
  graphics: [],
  motherboards: ['socket', 'chipset', 'form_factor'],
  memory: ['type'],
  storage: ['interface'],
  power: ['efficiency', 'modular'],
  cases: ['form_factor'],
  monitors: ['panel', 'resolution'],
}

/** Columns for the compact table: identity, then every spec the category defines. */
export function tableColumnsFor(category: string): string[] {
  return [...(CATEGORY_SPEC_FIELDS[category] ?? [])]
}

/* ----------------------------------------------------------------- facets */

export type ActiveFacets = Pick<
  CatalogueFacetValues,
  | 'category'
  | 'maxPrice'
  | 'brand'
  | 'socket'
  | 'chipset'
  | 'form_factor'
  | 'type'
  | 'efficiency'
  | 'modular'
  | 'interface'
  | 'panel'
  | 'resolution'
>

const LIST_FACET_KEYS = [
  'brand',
  'socket',
  'chipset',
  'form_factor',
  'type',
  'efficiency',
  'modular',
  'interface',
  'panel',
  'resolution',
] as const

type ListFacetKey = (typeof LIST_FACET_KEYS)[number]

function valueFor(product: Product, key: ListFacetKey): string | undefined {
  if (key === 'brand') return product.brand
  const raw = product.specs?.[key]
  if (raw === undefined || raw === null) return undefined
  return Array.isArray(raw) ? raw.join(', ') : String(raw)
}

/** Does a product satisfy every active facet, optionally ignoring one of them? */
export function matches(
  product: Product,
  facets: ActiveFacets,
  ignore?: keyof ActiveFacets,
): boolean {
  if (ignore !== 'category' && facets.category && product.category !== facets.category) return false
  if (ignore !== 'maxPrice' && facets.maxPrice !== null && product.price > facets.maxPrice) {
    return false
  }
  for (const key of LIST_FACET_KEYS) {
    if (ignore === key) continue
    const selected = facets[key]
    if (selected.length === 0) continue
    const value = valueFor(product, key)
    if (value === undefined || !selected.includes(value)) return false
  }
  return true
}

export function applyFacets(products: Product[], facets: ActiveFacets): Product[] {
  return products.filter((p) => matches(p, facets))
}

export interface FacetOption {
  value: string
  label: string
  /** How many results this option would yield alongside the other active facets. */
  count: number
  selected: boolean
}

/**
 * Counts are computed against every *other* active facet, not the full result
 * set. That is what makes a facet list useful: it answers "what happens if I
 * click this", so an option that would return nothing reads as disabled rather
 * than sending you to an empty page.
 */
export function facetOptions(
  products: Product[],
  facets: ActiveFacets,
  key: ListFacetKey,
): FacetOption[] {
  // Universe: every value the current *category* offers, so an option that other
  // facets have ruled out stays listed at zero and renders disabled. Dropping it
  // instead makes the rail reflow under the cursor as you filter.
  const universe = products.filter(
    (p) => !facets.category || p.category === facets.category,
  )
  const pool = products.filter((p) => matches(p, facets, key))

  const counts = new Map<string, number>()
  for (const product of universe) {
    const value = valueFor(product, key)
    if (value !== undefined) counts.set(value, 0)
  }
  for (const product of pool) {
    const value = valueFor(product, key)
    if (value === undefined) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  const selected = facets[key]
  // Selected values stay listed even at zero, or removing them becomes impossible.
  for (const value of selected) if (!counts.has(value)) counts.set(value, 0)

  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: value, count, selected: selected.includes(value) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/** Category counts, respecting every facet except the category itself. */
export function categoryOptions(products: Product[], facets: ActiveFacets): FacetOption[] {
  const pool = products.filter((p) => matches(p, facets, 'category'))
  const counts = new Map<string, number>()
  for (const product of pool) {
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      label: categoryLabel(value) ?? value,
      count,
      selected: facets.category === value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Facets currently narrowing the result set, for the chip row. */
export function activeFacetChips(
  facets: ActiveFacets,
): { key: keyof ActiveFacets; label: string; value: string }[] {
  const chips: { key: keyof ActiveFacets; label: string; value: string }[] = []
  if (facets.category) {
    chips.push({
      key: 'category',
      label: 'Category',
      value: categoryLabel(facets.category) ?? facets.category,
    })
  }
  for (const key of LIST_FACET_KEYS) {
    for (const value of facets[key]) {
      chips.push({ key, label: key === 'brand' ? 'Brand' : specLabel(key), value })
    }
  }
  if (facets.maxPrice !== null) {
    chips.push({ key: 'maxPrice', label: 'Under', value: formatLKR(facets.maxPrice) })
  }
  return chips
}

/**
 * When nothing matches, work out which single facet is responsible so the empty
 * state can name it — "Raising the price cap to X shows 6" beats "no results".
 * Returns the facet whose removal recovers the most products.
 */
export function relaxationHint(
  products: Product[],
  facets: ActiveFacets,
): { key: keyof ActiveFacets; label: string; recovered: number } | null {
  const candidates: (keyof ActiveFacets)[] = []
  if (facets.category) candidates.push('category')
  if (facets.maxPrice !== null) candidates.push('maxPrice')
  for (const key of LIST_FACET_KEYS) if (facets[key].length > 0) candidates.push(key)

  let best: { key: keyof ActiveFacets; label: string; recovered: number } | null = null
  for (const key of candidates) {
    const recovered = products.filter((p) => matches(p, facets, key)).length
    if (recovered > 0 && (!best || recovered > best.recovered)) {
      const label =
        key === 'maxPrice' ? 'the price cap' : key === 'brand' ? 'the brand filter' : key === 'category' ? 'the category' : `the ${specLabel(key).toLowerCase()} filter`
      best = { key, label, recovered }
    }
  }
  return best
}

/* ------------------------------------------------------------------ sort */

export interface SortOption {
  value: string
  label: string
}

export const BASE_SORTS: SortOption[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price:asc', label: 'Price, low to high' },
  { value: 'price:desc', label: 'Price, high to low' },
  { value: 'title:asc', label: 'Name, A–Z' },
]

/** Compact mode adds every numeric spec in the category as a sort key. */
export function sortOptionsFor(category: string): SortOption[] {
  const numericSpecs = (CATEGORY_SPEC_FIELDS[category] ?? []).filter((key) =>
    ['cores', 'threads', 'tdp', 'vram_gb', 'length_mm', 'ram_slots', 'speed', 'cas', 'wattage', 'max_gpu_mm', 'max_cooler_mm', 'read_mbs', 'size', 'refresh'].includes(key),
  )
  return [
    ...BASE_SORTS,
    ...numericSpecs.flatMap((key) => [
      { value: `${key}:desc`, label: `${specLabel(key)}, high to low` },
      { value: `${key}:asc`, label: `${specLabel(key)}, low to high` },
    ]),
  ]
}

function sortValue(product: Product, key: string): number | string {
  if (key === 'price') return product.price
  if (key === 'title') return product.title
  const raw = product.specs?.[key]
  if (typeof raw === 'number') return raw
  const parsed = Number(String(raw ?? '').replace(/[^\d.]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export function sortProducts(products: Product[], sort: string): Product[] {
  if (!sort || sort === 'relevance') return products
  const [key, direction = 'asc'] = sort.split(':')
  const factor = direction === 'desc' ? -1 : 1

  return [...products].sort((a, b) => {
    const av = sortValue(a, key)
    const bv = sortValue(b, key)
    if (typeof av === 'string' || typeof bv === 'string') {
      return String(av).localeCompare(String(bv)) * factor
    }
    return (av - bv) * factor
  })
}

export const MAX_COMPARE = 4

/* --------------------------------------------------------------- comparison */

export type BetterDirection = 'higher' | 'lower'

/**
 * Which way is better, for the value marked as the winner in a comparison.
 *
 * Only unambiguous specs are listed. TDP is deliberately `lower` (less heat and
 * power for the same job) while PSU wattage is `higher` (headroom) — they are
 * both watts and they point opposite ways, which is exactly why this cannot be
 * inferred from the unit. Anything absent here is never marked: a socket or a
 * panel type has no better, and guessing would be worse than staying silent.
 */
export const BETTER_DIRECTION: Record<string, BetterDirection> = {
  __price: 'lower',
  cores: 'higher',
  threads: 'higher',
  vram_gb: 'higher',
  speed: 'higher',
  ram_slots: 'higher',
  capacity: 'higher',
  read_mbs: 'higher',
  refresh: 'higher',
  size: 'higher',
  wattage: 'higher',
  max_gpu_mm: 'higher',
  max_cooler_mm: 'higher',
  tdp: 'lower',
  cas: 'lower',
  length_mm: 'lower',
}

/** Leading number in a value, so "32GB (2x16GB)" and "5.2" both compare. */
export function numericOf(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const match = /-?\d+(\.\d+)?/.exec(value.replace(/,/g, ''))
  return match ? Number(match[0]) : null
}

/**
 * Indices of the best values in a comparison, or none.
 *
 * Silent — deliberately — in three cases: the spec has no agreed direction, any
 * value is not numeric (a socket has no better), or every value is equal. A
 * tie across the whole row is not a win, but a tie *for* the best among three
 * marks both of the leaders: they genuinely are joint best.
 */
export function bestIndices(values: unknown[], direction: BetterDirection | undefined): number[] {
  if (!direction || values.length < 2) return []

  const numbers = values.map(numericOf)
  if (numbers.some((n) => n === null)) return []

  const found = numbers as number[]
  const best = direction === 'higher' ? Math.max(...found) : Math.min(...found)
  if (found.every((n) => n === best)) return []

  return found.map((n, i) => (n === best ? i : -1)).filter((i) => i >= 0)
}
