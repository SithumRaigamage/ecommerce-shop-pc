import { Tabs as TabsPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * `loading` replaces the whole control with skeletons — a spinner beside live
 * tab labels would suggest the labels themselves are settled when they are not.
 * `loadingTabs` sets how many placeholder triggers to draw.
 */
function Tabs({
  className,
  loading = false,
  loadingTabs = 3,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & {
  loading?: boolean
  loadingTabs?: number
}) {
  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading"
        className={cn('flex flex-col gap-stack', className)}
      >
        <div className="flex gap-0.5 rounded-md border border-border-subtle bg-surface-2 p-0.5">
          {Array.from({ length: loadingTabs }).map((_, i) => (
            <Skeleton key={i} className="h-7 flex-1 rounded-sm" />
          ))}
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-stack', className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Root>
  )
}

const tabsListVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      /* Segmented control. Outer radius md 8, inset 2 -> inner sm 6. */
      solid: 'w-fit gap-0.5 rounded-md border border-border-subtle bg-surface-2 p-0.5',
      /* Underlined. For page-level tabs where a filled bar would be too heavy. */
      underline: 'w-full gap-4 border-b border-border-subtle',
    },
  },
  defaultVariants: { variant: 'solid' },
})

function TabsList({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant ?? 'solid'}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'focus-ring inline-flex flex-1 items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap',
        'duration-fast ease-standard transition-colors',
        'text-fg-tertiary hover:text-fg-primary',
        'disabled:pointer-events-none disabled:text-fg-disabled',
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        // solid
        'group-data-[variant=solid]/list:rounded-sm',
        '[[data-variant=solid]_&]:h-7 [[data-variant=solid]_&]:rounded-sm [[data-variant=solid]_&]:px-3',
        '[[data-variant=solid]_&]:data-[state=active]:bg-surface-1 [[data-variant=solid]_&]:data-[state=active]:text-fg-primary',
        // underline
        '[[data-variant=underline]_&]:h-9 [[data-variant=underline]_&]:flex-none [[data-variant=underline]_&]:border-b-2 [[data-variant=underline]_&]:border-transparent',
        '[[data-variant=underline]_&]:data-[state=active]:border-accent-default [[data-variant=underline]_&]:data-[state=active]:text-fg-primary',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('focus-ring flex-1', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
