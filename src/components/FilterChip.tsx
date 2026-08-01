import { X } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface FilterChipProps {
  /** Facet name — "Brand", "Socket". Dimmed; the value is what matters. */
  label?: string
  value: string
  onRemove: () => void
  disabled?: boolean
  /** Removal in flight. */
  loading?: boolean
  className?: string
}

/**
 * An active facet, with its own removal control.
 *
 * The chip is not itself a button: nesting a remove button inside a button is
 * invalid, and the whole chip being clickable makes "remove" easy to hit by
 * accident. Only the × is interactive.
 */
export function FilterChip({
  label,
  value,
  onRemove,
  disabled = false,
  loading = false,
  className,
}: FilterChipProps) {
  const busy = disabled || loading

  return (
    <span
      data-slot="filter-chip"
      data-disabled={busy || undefined}
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full border border-border-default bg-surface-2 pr-1 pl-2.5 text-xs',
        'duration-fast ease-standard transition-colors',
        busy ? 'text-fg-disabled' : 'text-fg-primary',
        className,
      )}
    >
      {label && <span className="text-fg-tertiary">{label}</span>}
      <span className="font-medium">{value}</span>

      <button
        type="button"
        onClick={onRemove}
        disabled={busy}
        aria-label={label ? `Remove ${label} filter: ${value}` : `Remove filter: ${value}`}
        className={cn(
          'focus-ring inline-flex size-4 shrink-0 items-center justify-center rounded-full',
          'duration-fast ease-standard transition-colors',
          'text-fg-tertiary hover:bg-surface-3 hover:text-fg-primary active:bg-surface-1',
          'disabled:cursor-not-allowed disabled:text-fg-disabled disabled:hover:bg-transparent',
        )}
      >
        {loading ? <Spinner className="size-3" /> : <X className="size-3" aria-hidden="true" />}
      </button>
    </span>
  )
}
