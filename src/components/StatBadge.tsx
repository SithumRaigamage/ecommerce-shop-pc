import { cva, type VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const statBadgeVariants = cva(
  [
    'inline-flex items-center gap-1.5 rounded-xs border border-border-subtle bg-surface-2',
    'whitespace-nowrap',
  ],
  {
    variants: {
      size: {
        sm: 'h-5 px-1.5 text-xs',
        default: 'h-6 px-2 text-xs',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

interface StatBadgeProps extends VariantProps<typeof statBadgeVariants> {
  /** Short spec name — "VRAM", "Socket", "TDP". Kept in the sans stack. */
  label: string
  /** The measurement. Always monospace so badges line up across a card. */
  value: string | number
  /** Unit, rendered dimmer so the figure stays dominant. */
  unit?: string
  icon?: LucideIcon
  className?: string
}

/**
 * One spec, shown compactly on a product card — VRAM, socket, wattage.
 *
 * Replaces the deleted shadcn badge.tsx, which was a generic coloured pill with
 * no use in this design. A badge here always carries a label AND a value: a
 * bare "16GB" is ambiguous on a card that lists both VRAM and system memory.
 */
export function StatBadge({
  label,
  value,
  unit,
  icon: Icon,
  size,
  className,
}: StatBadgeProps) {
  return (
    <span
      data-slot="stat-badge"
      className={cn(statBadgeVariants({ size }), className)}
      title={`${label}: ${value}${unit ?? ''}`}
    >
      {Icon && <Icon className="size-3 shrink-0 text-fg-tertiary" aria-hidden="true" />}
      <span className="text-fg-tertiary">{label}</span>
      <span className="numeric font-medium text-fg-primary" data-numeric>
        {value}
        {unit && <span className="ml-0.5 text-fg-tertiary">{unit}</span>}
      </span>
    </span>
  )
}
