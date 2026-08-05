import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { formatLKR } from '@/lib/format'
import { cn } from '@/lib/utils'

const priceVariants = cva('numeric inline-flex items-baseline gap-2 text-fg-primary', {
  variants: {
    size: {
      sm: 'text-sm',
      default: 'text-lg',
      lg: 'text-2xl',
      xl: 'text-3xl',
    },
  },
  defaultVariants: { size: 'default' },
})

interface PriceDisplayProps extends VariantProps<typeof priceVariants> {
  /** Current price in LKR. */
  value: number
  /** Was-price. Rendered struck through when higher than `value`. */
  compareAt?: number
  /** Show the saving as a signed percentage next to the price. */
  showDelta?: boolean
  className?: string
}

/**
 * Every price on the site. Monospace with tabular figures so prices in a column
 * align on the decimal — the reason a spec-comparison site sets numerals in mono
 * at all (DESIGN.md §3).
 *
 * Price is deliberately NOT accent-coloured: it is information, not an
 * affordance. Accent on a price was flagged in the Stage 1 audit.
 */
export function PriceDisplay({
  value,
  compareAt,
  showDelta = false,
  size,
  className,
}: PriceDisplayProps) {
  const discounted = compareAt !== undefined && compareAt > value
  const deltaPct = discounted ? Math.round(((value - compareAt) / compareAt) * 100) : 0

  return (
    <span className={cn(priceVariants({ size }), className)}>
      <span className="font-semibold" data-numeric>
        {formatLKR(value)}
      </span>

      {discounted && (
        <s className="text-sm font-normal text-fg-tertiary decoration-fg-tertiary" data-numeric>
          <span className="sr-only">Was </span>
          {formatLKR(compareAt)}
        </s>
      )}

      {discounted && showDelta && (
        <span className="inline-flex items-center gap-0.5 rounded-xs bg-success-bg px-1.5 py-0.5 text-xs font-medium text-success-fg">
          <ArrowDown className="size-3" aria-hidden="true" />
          <span data-numeric>{Math.abs(deltaPct)}%</span>
          <span className="sr-only">cheaper than the compare-at price</span>
        </span>
      )}
    </span>
  )
}

interface PriceDeltaProps {
  /** Signed difference in LKR — positive means more expensive. */
  value: number
  className?: string
}

/**
 * A standalone signed price difference, for comparison rows. Direction is
 * carried by the arrow and the label, not by colour alone.
 */
export function PriceDelta({ value, className }: PriceDeltaProps) {
  if (value === 0) {
    return (
      <span className={cn('numeric text-sm text-fg-tertiary', className)} data-numeric>
        —<span className="sr-only">No difference</span>
      </span>
    )
  }

  const cheaper = value < 0
  const Icon = cheaper ? ArrowDown : ArrowUp

  return (
    <span
      className={cn(
        'numeric inline-flex items-center gap-1 text-sm font-medium',
        cheaper ? 'text-success-fg' : 'text-warning-fg',
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      <span data-numeric>{formatLKR(Math.abs(value))}</span>
      <span className="sr-only">{cheaper ? 'cheaper' : 'more expensive'}</span>
    </span>
  )
}
