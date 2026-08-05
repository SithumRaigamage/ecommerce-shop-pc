import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

/**
 * Six states, every variant:
 *   default        base surface + border
 *   hover          one step of surface/colour movement, never a size change
 *   active         a further step, so press is distinguishable from hover
 *   focus-visible  2px accent outline, 2px offset — from the `focus-ring` utility
 *   disabled       explicit disabled colours, not opacity (opacity muddies dark UI)
 *   loading        disabled + aria-busy + Spinner, label retained to avoid reflow
 *
 * Accent appears only on the primary variant and the focus ring — both
 * affordances. No variant uses accent decoratively.
 */
const buttonVariants = cva(
  [
    'focus-ring inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'rounded-md border font-medium select-none',
    'duration-fast ease-standard transition',
    'disabled:cursor-not-allowed',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: [
          'border-transparent bg-accent-default text-on-accent',
          'hover:bg-accent-hover active:bg-accent-active',
          'disabled:bg-surface-2 disabled:text-fg-disabled',
        ],
        secondary: [
          'border-border-default bg-surface-2 text-fg-primary',
          'hover:bg-surface-3 hover:border-border-strong active:bg-surface-2',
          'disabled:bg-surface-1 disabled:text-fg-disabled disabled:border-border-subtle',
        ],
        outline: [
          'border-border-default bg-transparent text-fg-primary',
          'hover:bg-surface-2 hover:border-border-strong active:bg-surface-3',
          'disabled:text-fg-disabled disabled:border-border-subtle disabled:hover:bg-transparent',
        ],
        ghost: [
          'border-transparent bg-transparent text-fg-secondary',
          'hover:bg-surface-2 hover:text-fg-primary active:bg-surface-3',
          'disabled:text-fg-disabled disabled:hover:bg-transparent',
        ],
        destructive: [
          'border-transparent bg-danger-fg text-on-accent',
          'hover:brightness-110 active:brightness-95',
          'disabled:bg-surface-2 disabled:text-fg-disabled disabled:hover:brightness-100',
        ],
        link: [
          'border-transparent bg-transparent text-accent-default underline-offset-4',
          'hover:underline active:text-accent-active',
          'disabled:text-fg-disabled disabled:hover:no-underline',
        ],
      },
      size: {
        sm: 'h-7 gap-1.5 px-2.5 text-xs',
        default: 'h-8 px-3 text-sm',
        lg: 'h-10 px-5 text-base',
        icon: 'size-8 p-0',
        'icon-sm': 'size-7 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  // A Slot child must remain a single element, so the spinner is only injected
  // for real <button>s. asChild callers own their own busy state.
  if (asChild) {
    return (
      <Slot.Root
        data-slot="button"
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Slot.Root>
    )
  }

  return (
    <button
      data-slot="button"
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled ?? loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && <Spinner className={size === 'sm' ? 'size-3.5' : 'size-4'} />}
      {children}
    </button>
  )
}

export { Button, buttonVariants }
