import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  /** One line, sentence case, states the fact. Not "Oops!". */
  title: string
  /** Optional second line explaining what would change the state. */
  description?: string
  /** Primary action — usually the thing that escapes the empty state. */
  action?: React.ReactNode
  /** Lower-emphasis alternative. */
  secondaryAction?: React.ReactNode
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
 * The single empty state. Before this, the cart sheet, product grid and checkout
 * each rendered their own bespoke arrangement of icon, copy and button.
 *
 * Not `role="status"` — an empty result is page content, not a live update. The
 * grid announces result counts separately.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  size = 'default',
  headingLevel,
  className,
}: EmptyStateProps) {
  const TitleTag = headingLevel ? (`h${headingLevel}` as const) : 'p'

  return (
    <div
      data-slot="empty-state"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm' ? 'gap-stack-tight py-8' : 'gap-stack py-16',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full border border-border-subtle bg-surface-2 text-fg-tertiary',
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
        {description && (
          <p className="max-w-prose text-sm text-fg-tertiary">{description}</p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-stack-tight">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
