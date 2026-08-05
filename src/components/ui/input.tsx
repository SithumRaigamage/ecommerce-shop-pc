import * as React from 'react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface InputProps extends React.ComponentProps<'input'> {
  loading?: boolean
}

/**
 * States: default / hover (border lifts) / active i.e. focused / focus-visible
 * (2px accent outline) / disabled / loading (disabled + trailing Spinner).
 * Invalid is driven by aria-invalid, which react-hook-form sets via Field.
 */
function Input({ className, type, loading = false, disabled, ...props }: InputProps) {
  const input = (
    <input
      type={type}
      data-slot="input"
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={cn(
        'focus-ring h-8 w-full min-w-0 rounded-md border border-border-default bg-surface-1 px-3 text-sm',
        'text-fg-primary placeholder:text-fg-tertiary',
        'duration-fast ease-standard transition-colors',
        'hover:border-border-strong',
        'aria-invalid:border-danger-fg',
        'disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-2 disabled:text-fg-disabled disabled:placeholder:text-fg-disabled',
        // File inputs render their own button; keep it on-token.
        'file:mr-3 file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-fg-secondary',
        'selection:bg-accent-subtle selection:text-fg-primary',
        loading && 'pr-9',
        className,
      )}
      {...props}
    />
  )

  if (!loading) return input

  return (
    <div className="relative w-full">
      {input}
      <Spinner className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-tertiary" />
    </div>
  )
}

export { Input }
