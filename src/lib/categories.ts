import {
  Armchair,
  Box,
  Cable,
  CircuitBoard,
  Cpu,
  Gamepad2,
  HardDrive,
  Headphones,
  Keyboard,
  Laptop,
  MemoryStick,
  Monitor,
  Network,
  Plug,
  Projector,
  ShieldCheck,
  Snowflake,
  Tv,
  Usb,
  Video,
  Webcam,
  type LucideIcon,
} from 'lucide-react'

export interface CategoryDefinition {
  /** Canonical slug used in URLs and by `getProductsByCategory`. */
  slug: string
  label: string
  icon: LucideIcon
}

/**
 * The catalogue is scraped, so `products.json` carries inconsistent category
 * values: casing drift ("Laptop" vs "laptop"), a stray trailing comma
 * ("speakers,"), and several near-synonyms ("tv"/"television", "casings"/"cases").
 *
 * Rewriting the JSON would be undone the next time `Web_Scraper/` runs, so the
 * aliases are resolved here — at the boundary where the data is read. Keys must
 * be lowercase; `normalizeCategory` lowercases before lookup.
 */
const CATEGORY_ALIASES: Record<string, string> = {
  apple: 'laptop',
  casings: 'cases',
  console: 'gaming',
  expansion: 'networking',
  external: 'external-storage',
  live: 'streaming',
  os: 'software',
  'speakers,': 'audio',
  speakers: 'audio',
  television: 'tv',
}

/** Maps a raw catalogue category onto its canonical slug. */
export function normalizeCategory(raw: string | undefined | null): string {
  if (!raw) return ''
  const key = raw.trim().toLowerCase()
  return CATEGORY_ALIASES[key] ?? key
}

/**
 * Every canonical category, in sidebar order. Kept in sync with the catalogue by
 * `categories.test.ts`, which fails if the data grows a category with no entry
 * here (or if an entry here matches no products).
 */
export const CATEGORIES: CategoryDefinition[] = [
  { slug: 'gaming', label: 'Console & Handheld Gaming', icon: Gamepad2 },
  { slug: 'laptop', label: 'Laptops', icon: Laptop },
  { slug: 'desktops', label: 'Desktop PCs', icon: Monitor },
  { slug: 'monitors', label: 'Monitors', icon: Monitor },
  { slug: 'processor', label: 'Processors', icon: Cpu },
  { slug: 'motherboards', label: 'Motherboards', icon: CircuitBoard },
  { slug: 'memory', label: 'Memory (RAM)', icon: MemoryStick },
  { slug: 'graphics', label: 'Graphics Cards', icon: Video },
  { slug: 'storage', label: 'Storage', icon: HardDrive },
  { slug: 'external-storage', label: 'External Storage', icon: Usb },
  { slug: 'power', label: 'Power Supply & UPS', icon: Plug },
  { slug: 'cooling', label: 'Cooling & Lighting', icon: Snowflake },
  { slug: 'cases', label: 'PC Cases', icon: Box },
  { slug: 'audio', label: 'Speakers & Headsets', icon: Headphones },
  { slug: 'peripherals', label: 'Keyboard & Mouse', icon: Keyboard },
  { slug: 'chairs', label: 'Gaming Chairs', icon: Armchair },
  { slug: 'cables', label: 'Cables & Adapters', icon: Cable },
  { slug: 'networking', label: 'Networking', icon: Network },
  { slug: 'streaming', label: 'Webcams & Streaming', icon: Webcam },
  { slug: 'tv', label: 'TVs', icon: Tv },
  { slug: 'projectors', label: 'Projectors', icon: Projector },
  { slug: 'software', label: 'Software & Security', icon: ShieldCheck },
]

const BY_SLUG = new Map(CATEGORIES.map((category) => [category.slug, category]))

export function categoryLabel(slug: string | null | undefined): string | undefined {
  return slug ? BY_SLUG.get(slug)?.label : undefined
}
