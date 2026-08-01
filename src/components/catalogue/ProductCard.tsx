import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { PriceDisplay } from '@/components/PriceDisplay'
import { ProductImage } from '@/components/ProductImage'
import { StatBadge } from '@/components/StatBadge'
import { Cluster, Stack } from '@/components/layout/primitives'
import { HEADLINE_SPECS, SPEC_UNITS, specLabel } from '@/lib/catalogue'
import type { Product } from '@/types'

/**
 * Card geometry, declared once so the skeleton cannot drift from the real card.
 * Every fixed dimension the card relies on lives here and both variants read it.
 */
const GEOMETRY = {
  media: 'h-48 w-full',
  brand: 'h-4 w-16',
  title: 'h-5 w-full',
  titleSecond: 'h-5 w-2/3',
  badge: 'h-6 w-24',
  price: 'h-7 w-32',
  action: 'h-8 w-full',
} as const

function headlineSpecs(product: Product) {
  const keys = HEADLINE_SPECS[product.category] ?? []
  return keys
    .map((key) => ({ key, value: product.specs?.[key] }))
    .filter((s) => s.value !== undefined && s.value !== null)
    .map((s) => ({
      key: s.key,
      value: Array.isArray(s.value) ? s.value.length : (s.value as string | number),
      unit: Array.isArray(s.value) ? undefined : SPEC_UNITS[s.key],
    }))
}

interface ProductCardProps {
  product: Product
  selected: boolean
  onToggleCompare: (id: string) => void
  /** Selection is capped; an unselected card past the cap is disabled, not hidden. */
  compareDisabled: boolean
}

export function ProductCard({
  product,
  selected,
  onToggleCompare,
  compareDisabled,
}: ProductCardProps) {
  const compareId = `compare-${product.id}`

  return (
    <Card className="group flex h-full flex-col overflow-hidden pt-0">
      <div className={`relative overflow-hidden bg-surface-2 ${GEOMETRY.media}`}>
        <ProductImage
          src={product.image}
          alt={product.title}
          className="size-full object-contain duration-base ease-standard transition-transform group-hover:scale-105"
        />
        {/* Compare lives on the card so a comparison can be built while scanning,
            without opening each product first. */}
        <div className="absolute top-2 left-2 flex items-center gap-2 rounded-md border border-border-subtle bg-bg/90 px-2 py-1">
          <Checkbox
            id={compareId}
            checked={selected}
            disabled={compareDisabled && !selected}
            onCheckedChange={() => onToggleCompare(product.id)}
          />
          <Label htmlFor={compareId} className="text-xs">
            Compare
          </Label>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-stack-tight">
        <p className="text-xs text-fg-tertiary">{product.brand}</p>
        <h3 className="line-clamp-2 text-sm font-medium text-fg-primary">
          {/*
            Deliberately NOT a stretched link (`after:absolute after:inset-0`):
            a full-card overlay sits on top of the compare checkbox and the
            View Details button and swallows their clicks. The card has an
            explicit action; the title is a second, narrower target.
          */}
          <Link
            to={`/product-overview/${product.id}`}
            className="focus-ring rounded-xs hover:text-accent-default"
          >
            {product.title}
          </Link>
        </h3>

        <Cluster gap="tight" className="min-h-6">
          {headlineSpecs(product).map((spec) => (
            <StatBadge
              key={spec.key}
              size="sm"
              label={specLabel(spec.key)}
              value={spec.value}
              unit={spec.unit}
            />
          ))}
        </Cluster>

        <PriceDisplay value={product.price} className="mt-auto pt-stack-tight" />

        <Button asChild className={GEOMETRY.action}>
          <Link to={`/product-overview/${product.id}`}>
            View Details<span className="sr-only"> for {product.title}</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Same shell, same fixed dimensions, same number of rows — so swapping the
 * skeleton for the card shifts nothing. Mismatched skeletons are the most
 * common source of layout shift, and the only reliable fix is sharing the
 * geometry constants rather than eyeballing heights.
 */
export function ProductCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden pt-0" aria-hidden="true">
      <Skeleton className={`${GEOMETRY.media} rounded-none`} />
      <CardContent className="flex flex-1 flex-col gap-stack-tight">
        <Skeleton className={GEOMETRY.brand} />
        <Stack gap="tight">
          <Skeleton className={GEOMETRY.title} />
          <Skeleton className={GEOMETRY.titleSecond} />
        </Stack>
        <Cluster gap="tight" className="min-h-6">
          <Skeleton className={GEOMETRY.badge} />
          <Skeleton className={GEOMETRY.badge} />
        </Cluster>
        <Skeleton className={`${GEOMETRY.price} mt-auto`} />
        <Skeleton className={GEOMETRY.action} />
      </CardContent>
    </Card>
  )
}
