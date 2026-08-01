import * as React from 'react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.ComponentProps<'textarea'> {
  loading?: boolean
}

function Textarea({ className, loading = false, disabled, ...props }: TextareaProps) {
  const textarea = (
    <textarea
      data-slot="textarea"
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={cn(
        'focus-ring field-sizing-content min-h-16 w-full rounded-md border border-border-default bg-surface-1 px-3 py-2 text-sm',
        'text-fg-primary placeholder:text-fg-tertiary',
        'duration-fast ease-standard transition-colors',
        'hover:border-border-strong',
        'aria-invalid:border-danger-fg',
        'disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-2 disabled:text-fg-disabled disabled:placeholder:text-fg-disabled',
        'selection:bg-accent-subtle selection:text-fg-primary',
        className,
      )}
      {...props}
    />
  )

  if (!loading) return textarea

  return (
    <div className="relative w-full">
      {textarea}
      <Spinner className="pointer-events-none absolute top-3 right-3 text-fg-tertiary" />
    </div>
  )
}

export { Textarea }
