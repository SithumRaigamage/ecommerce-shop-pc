import manifest from '@/lib/media-manifest.json'

export type MediaFormat = 'avif' | 'webp'
export type MediaTheme = 'light' | 'dark'

interface ManifestEntry {
  /** Public directory the built assets live in. */
  base: string
  widths: number[]
  formats: MediaFormat[]
  /**
   * True when the source had no alpha and the pipeline baked a surface colour
   * behind it, which means there is one asset set per theme.
   */
  themed: boolean
  /** 20px WebP data URI for blur-up, or null if the build produced none. */
  lqip: string | null
  /** Short hash of the source file, so `npm run media:check` can spot drift. */
  hash?: string
  /** Copied from the provenance ledger at build time. */
  licence?: string
}

/** A manifest entry that knows its own key, so callers never carry the two separately. */
export interface MediaEntry extends ManifestEntry {
  id: string
}

const MEDIA = manifest as { generated: string; products: Record<string, ManifestEntry> }

/**
 * Built imagery for an asset key, or null.
 *
 * Null is a supported state, not an error: a product with no cleared photography
 * renders the designed placeholder, and that is the catalogue's normal condition
 * until assets are licensed and ingested.
 */
export function mediaFor(assetId: string | null | undefined): MediaEntry | null {
  if (!assetId) return null
  const entry = MEDIA.products[assetId]
  return entry ? { ...entry, id: assetId } : null
}

export function assetPath(
  entry: MediaEntry,
  width: number,
  format: MediaFormat,
  theme: MediaTheme | null,
): string {
  const suffix = theme ? `-${theme}` : ''
  return `${entry.base}/${entry.id}${suffix}-${width}.${format}`
}

/**
 * A `srcset` across every built width.
 *
 * Width descriptors rather than `2x`/`3x`: the same card is a different number
 * of CSS pixels at every breakpoint, so the browser needs to solve for the
 * layout it actually has, using this together with `sizes`.
 */
export function srcSetFor(
  entry: MediaEntry,
  format: MediaFormat,
  theme: MediaTheme | null,
): string {
  return entry.widths.map((width) => `${assetPath(entry, width, format, theme)} ${width}w`).join(', ')
}

/** Every asset key with built imagery. */
export function builtAssetIds(): string[] {
  return Object.keys(MEDIA.products)
}

/**
 * `sizes` per layout, declared once.
 *
 * These have to track the real grids: ProductGrid runs 1/2/2/3/4 columns across
 * the breakpoints, so a card is roughly a fifth of the catalogue container at
 * 2xl. A stale value here is invisible in review and costs real bytes.
 */
export const SIZES = {
  card: '(min-width: 1536px) 22vw, (min-width: 1280px) 28vw, (min-width: 1024px) 40vw, (min-width: 640px) 45vw, 92vw',
  detail: '(min-width: 1024px) 45vw, 92vw',
  thumbnail: '96px',
  cartLine: '80px',
  checkoutLine: '(min-width: 640px) 152px, 100vw',
  featured: '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw',
} as const
