import {
  Box,
  CircuitBoard,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Plug,
  Video,
  type LucideIcon,
} from 'lucide-react'

export interface CategoryDefinition {
  /** Canonical slug used in URLs and by `getProductsByCategory`. */
  slug: string
  label: string
  icon: LucideIcon
}

/**
 * Normalises a raw category value onto its canonical slug.
 *
 * The synonym map this used to carry ("casings"→"cases", "speakers,"→"audio",
 * "television"→"tv", …) existed to repair scraped output; the curated catalogue
 * writes canonical slugs directly, so only case and whitespace need normalising.
 * `scripts/validate-catalogue.ts` rejects any category outside `CATEGORIES`.
 */
export function normalizeCategory(raw: string | undefined | null): string {
  if (!raw) return ''
  return raw.trim().toLowerCase()
}

/**
 * Every canonical category, in sidebar order. Kept in sync with the catalogue by
 * `categories.test.ts`, which fails if the data grows a category with no entry
 * here (or if an entry here matches no products).
 */
export const CATEGORIES: CategoryDefinition[] = [
  { slug: 'processor', label: 'Processors', icon: Cpu },
  { slug: 'graphics', label: 'Graphics Cards', icon: Video },
  { slug: 'motherboards', label: 'Motherboards', icon: CircuitBoard },
  { slug: 'memory', label: 'Memory (RAM)', icon: MemoryStick },
  { slug: 'storage', label: 'Storage', icon: HardDrive },
  { slug: 'power', label: 'Power Supplies', icon: Plug },
  { slug: 'cases', label: 'PC Cases', icon: Box },
  { slug: 'monitors', label: 'Monitors', icon: Monitor },
]

const BY_SLUG = new Map(CATEGORIES.map((category) => [category.slug, category]))

export function categoryLabel(slug: string | null | undefined): string | undefined {
  return slug ? BY_SLUG.get(slug)?.label : undefined
}
