import { ImageOff } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'
import { cn } from '@/lib/utils'

interface ProductPlaceholderProps {
  /** Drives the glyph. An unknown or missing category falls back to a neutral mark. */
  category?: string | null
  /** Printed in mono. This is the part that makes it informative rather than empty. */
  mpn?: string | null
  alt: string
  className?: string
}

const GLYPHS = new Map(CATEGORIES.map((category) => [category.slug, category.icon]))

/**
 * The designed placeholder: a category glyph on --surface-2 with the MPN set in
 * mono beneath it.
 *
 * Two things separate this from a broken image. It carries information — the
 * part number is what a buyer would search to find the manufacturer's own photo
 * — and it shares the product card's geometry exactly, so a grid where half the
 * products have photography and half do not still reads as one grid rather than
 * as a page with holes in it.
 *
 * It is a component rather than a generated raster on purpose. A raster
 * placeholder would have to be built twice, once per theme, and rebuilt every
 * time a surface token moved; drawn here it is correct in both themes for free,
 * sharp at any size, and costs no bytes.
 */
export function ProductPlaceholder({ category, mpn, alt, className }: ProductPlaceholderProps) {
  const Glyph = (category && GLYPHS.get(category)) || ImageOff

  return (
    <div
      role="img"
      aria-label={alt}
      data-slot="product-placeholder"
      className={cn(
        'flex flex-col items-center justify-center gap-3 bg-surface-2 p-4 text-fg-tertiary',
        className,
      )}
    >
      {/* Held well back: it labels the space, it does not compete with the
          product titles and prices around it. */}
      <Glyph className="size-10 opacity-35" strokeWidth={1.25} aria-hidden="true" />

      {mpn && (
        <span
          data-numeric
          className="numeric max-w-full truncate text-xs tracking-wide text-fg-tertiary opacity-70"
        >
          {mpn}
        </span>
      )}
    </div>
  )
}
