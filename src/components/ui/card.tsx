import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Elevation is a prop, not a set of ad-hoc classes, so a card cannot take the
 * background of one level and the border of another. See DESIGN.md §5.
 */
const cardVariants = cva(
  ['rounded-lg border', 'duration-fast ease-standard transition-colors'],
  {
    variants: {
      elevation: {
        1: 'elevation-1',
        2: 'elevation-2',
        3: 'elevation-3',
      },
      interactive: {
        true: 'focus-ring hover:border-border-strong cursor-pointer',
        false: '',
      },
    },
    defaultVariants: { elevation: 1, interactive: false },
  },
)

function Card({
  className,
  elevation,
  interactive,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ elevation, interactive }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'flex flex-col gap-stack-tight p-card-padding',
        // With a CardAction present the header becomes a row: title block left,
        // action right. Avoids an arbitrary grid template.
        'has-data-[slot=card-action]:flex-row has-data-[slot=card-action]:items-start has-data-[slot=card-action]:justify-between',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('font-display text-xl leading-none font-semibold text-fg-primary', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-fg-tertiary', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('shrink-0 self-start', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('p-card-padding [&:not(:first-child)]:pt-0', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center gap-stack-tight border-t border-border-subtle p-card-padding',
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
