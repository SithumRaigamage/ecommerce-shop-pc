import { cva, type VariantProps } from 'class-variance-authority'
import { CircleCheck, CircleSlash, Clock, PackageX } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StockState } from '@/lib/stock'

/** Anything that shows availability uses this component. See lib/stock.ts. */
const CONFIG: Record<
  StockState,
  { label: string; Icon: typeof CircleCheck; tone: 'success' | 'warning' | 'danger' | 'neutral' }
> = {
  'in-stock': { label: 'In stock', Icon: CircleCheck, tone: 'success' },
  'low-stock': { label: 'Low stock', Icon: Clock, tone: 'warning' },
  'out-of-stock': { label: 'Out of stock', Icon: PackageX, tone: 'danger' },
  discontinued: { label: 'Discontinued', Icon: CircleSlash, tone: 'neutral' },
}

const indicatorVariants = cva('inline-flex items-center gap-1.5 font-medium', {
  variants: {
    tone: {
      success: 'text-success-fg',
      warning: 'text-warning-fg',
      danger: 'text-danger-fg',
      neutral: 'text-fg-tertiary',
    },
    size: {
      sm: 'text-xs',
      default: 'text-sm',
    },
    variant: {
      text: '',
      pill: 'rounded-full border px-2 py-0.5',
    },
  },
  compoundVariants: [
    { variant: 'pill', tone: 'success', class: 'border-success-border bg-success-bg' },
    { variant: 'pill', tone: 'warning', class: 'border-warning-border bg-warning-bg' },
    { variant: 'pill', tone: 'danger', class: 'border-danger-border bg-danger-bg' },
    { variant: 'pill', tone: 'neutral', class: 'border-border-subtle bg-surface-2' },
  ],
  defaultVariants: { size: 'default', variant: 'text' },
})

interface StockIndicatorProps
  extends Omit<VariantProps<typeof indicatorVariants>, 'tone'> {
  state: StockState
  /** Units remaining. Only rendered for `low-stock`, where it changes behaviour. */
  quantity?: number
  className?: string
}

export type { StockState }

export function StockIndicator({
  state,
  quantity,
  size,
  variant,
  className,
}: StockIndicatorProps) {
  const { label, Icon, tone } = CONFIG[state]
  const showQuantity = state === 'low-stock' && typeof quantity === 'number'

  return (
    <span
      data-slot="stock-indicator"
      data-state={state}
      className={cn(indicatorVariants({ tone, size, variant }), className)}
    >
      {/* Icon carries the state as well as colour, so the meaning survives
          greyscale and colour-blindness. */}
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
      {showQuantity && (
        <span className="numeric text-fg-tertiary" data-numeric>
          ({quantity})
        </span>
      )}
    </span>
  )
}
