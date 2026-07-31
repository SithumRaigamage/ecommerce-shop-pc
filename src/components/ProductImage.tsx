import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { assetUrl } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  src: string | null | undefined
  alt: string
  className?: string
}

/**
 * The curated catalogue ships `image: null` until imagery is sourced, and a bare
 * <img> with a missing or broken src renders as a broken-image box with alt text
 * spilling over the card. Fall back to a neutral placeholder instead; the alt
 * text stays available to assistive tech via the wrapper's label.
 */
export function ProductImage({ src, alt, className }: ProductImageProps) {
  const resolved = assetUrl(src)
  const [failed, setFailed] = useState(!resolved)

  // A new src deserves a fresh attempt (e.g. switching gallery thumbnails).
  useEffect(() => {
    setFailed(!resolved)
  }, [resolved])

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'bg-muted text-muted-foreground flex items-center justify-center',
          className,
        )}
      >
        <ImageOff className="size-8 opacity-60" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={resolved}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
