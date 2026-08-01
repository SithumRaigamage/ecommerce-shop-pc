import { useEffect, useState } from 'react'
import { ProductPlaceholder } from '@/components/ProductPlaceholder'
import { useTheme } from '@/hooks/useTheme'
import { mediaFor, srcSetFor, type MediaEntry } from '@/lib/media'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  /**
   * Manifest key. Normally the product id; a gallery uses `${id}-2`, `${id}-3`.
   * A key with no built imagery renders the designed placeholder.
   */
  assetId: string | null | undefined
  alt: string
  /** Placeholder inputs. Worth passing even when imagery exists — the error path uses them. */
  category?: string | null
  mpn?: string | null
  /**
   * Required. The browser picks a candidate from `srcset` before layout, so it
   * cannot work this out on its own, and a wrong `sizes` silently downloads the
   * 1600px asset for a 200px card.
   */
  sizes: string
  /** Skip lazy-loading and fetch eagerly. For above-the-fold imagery only. */
  priority?: boolean
  className?: string
}

/** Intrinsic ratio the browser reserves before the bytes arrive. Square, per the pipeline. */
const INTRINSIC = 800

const reported = new Set<string>()

/**
 * A broken image is a systemic failure — a build that did not run, a file that
 * did not deploy — and it should be visible to whoever can fix it rather than
 * quietly absorbed. The placeholder keeps the page intact for the visitor; this
 * keeps the cause on the record.
 */
function reportBrokenAsset(assetId: string, src: string) {
  if (reported.has(assetId)) return
  reported.add(assetId)
  console.warn(
    `[media] "${assetId}" is in the manifest but failed to load (${src}). ` +
      'The designed placeholder is standing in. Run: npm run media',
  )
}

/**
 * Product imagery.
 *
 * Serves AVIF with a WebP fallback at three widths, reserves the box before the
 * bytes arrive so nothing reflows, blurs up from a 20px LQIP inlined in the
 * manifest, and falls back to the designed placeholder — never to a broken-image
 * box with alt text spilling across the card.
 */
export function ProductImage({
  assetId,
  alt,
  category,
  mpn,
  sizes,
  priority = false,
  className,
}: ProductImageProps) {
  const { theme } = useTheme()
  const entry: MediaEntry | null = mediaFor(assetId)

  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // A new asset deserves a fresh attempt, e.g. switching gallery thumbnails.
  useEffect(() => {
    setFailed(false)
    setLoaded(false)
  }, [assetId, theme])

  if (!entry || failed) {
    return <ProductPlaceholder category={category} mpn={mpn} alt={alt} className={className} />
  }

  const variant = entry.themed ? theme : null
  const fallback = `${entry.base}/${assetId}${variant ? `-${variant}` : ''}-800.webp`

  return (
    // The LQIP sits on the wrapper, not the <img>: a background survives the
    // image's own transparency, so an alpha asset blurs up over its own colours
    // rather than over the surface.
    <div
      className={cn('relative overflow-hidden bg-surface-2', className)}
      style={
        entry.lqip ? { backgroundImage: `url(${entry.lqip})`, backgroundSize: 'cover' } : undefined
      }
    >
      <picture>
        <source type="image/avif" srcSet={srcSetFor(entry, 'avif', variant)} sizes={sizes} />
        <source type="image/webp" srcSet={srcSetFor(entry, 'webp', variant)} sizes={sizes} />
        <img
          src={fallback}
          alt={alt}
          width={INTRINSIC}
          height={INTRINSIC}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          onLoad={() => setLoaded(true)}
          onError={() => {
            reportBrokenAsset(assetId ?? 'unknown', fallback)
            setFailed(true)
          }}
          className={cn(
            'size-full object-contain duration-fast ease-standard transition-opacity',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      </picture>
    </div>
  )
}
