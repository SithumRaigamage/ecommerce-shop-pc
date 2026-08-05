import { cn } from '@/lib/utils'

/**
 * The loading state for anything that is not a control — and the documented
 * substitute for a `loading` prop on Checkbox, RadioGroup, Tabs, Accordion and
 * PriceSlider, where an inline spinner would be nonsense.
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-surface-2', className)}
      {...props}
    />
  )
}

export { Skeleton }
