import type { LucideIcon } from 'lucide-react'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  icon?: LucideIcon
  title?: string
  /** What failed, in plain language. Never a raw exception message. */
  description?: string
  onRetry?: () => void
  retryLabel?: string
  /** Retry in flight. */
  retrying?: boolean
  action?: React.ReactNode
  size?: 'sm' | 'default'
  /**
   * Render the title as a real heading. A page-level state is the main thing on
   * screen and needs to appear in the document outline; a state nested inside a
   * card should stay a paragraph so it does not pollute the outline.
   */
  headingLevel?: 1 | 2 | 3
  className?: string
}

/**
 * Same shape as EmptyState, different semantics: this one is `role="alert"`
 * because it reports a failure the user did not ask for.
 *
 * Pairs with the Stage 0 error surfacing — `useAsync` returns `error`, this
 * renders it, and `retry` drives the button.
 */
export function ErrorState({
  icon: Icon = TriangleAlert,
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Try again',
  retrying = false,
  action,
  size = 'default',
  headingLevel,
  className,
}: ErrorStateProps) {
  const TitleTag = headingLevel ? (`h${headingLevel}` as const) : 'p'

  return (
    <div
      data-slot="error-state"
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm' ? 'gap-stack-tight py-8' : 'gap-stack py-16',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full border border-danger-border bg-danger-bg text-danger-fg',
          size === 'sm' ? 'size-9' : 'size-12',
        )}
      >
        <Icon className={size === 'sm' ? 'size-4' : 'size-5'} aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-1">
        <TitleTag
          className={cn(
            'font-medium text-fg-primary',
            size === 'sm' ? 'text-sm' : 'text-base',
            headingLevel === 1 && 'font-display text-2xl font-semibold',
          )}
        >
          {title}
        </TitleTag>
        {description && <p className="max-w-prose text-sm text-fg-tertiary">{description}</p>}
      </div>

      {(onRetry || action) && (
        <div className="flex flex-wrap items-center justify-center gap-stack-tight">
          {onRetry && (
            <Button variant="outline" onClick={onRetry} loading={retrying}>
              {retryLabel}
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  )
}
