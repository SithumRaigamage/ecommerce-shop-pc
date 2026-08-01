import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { CheckIcon, MinusIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * `loading` renders a same-size Skeleton rather than a spinner: a spinner inside
 * a 16px box is illegible. The control keeps its footprint so nothing reflows.
 */
function Checkbox({
  className,
  loading = false,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & { loading?: boolean }) {
  if (loading) {
    return (
      <Skeleton
        role="status"
        aria-label="Loading"
        aria-hidden={undefined}
        className={cn('size-4 rounded-xs', className)}
      />
    )
  }

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'focus-ring peer size-4 shrink-0 rounded-xs border border-border-strong bg-surface-1',
        'duration-fast ease-standard transition-colors',
        'hover:border-accent-default',
        'data-[state=checked]:border-accent-default data-[state=checked]:bg-accent-default data-[state=checked]:text-on-accent',
        'data-[state=indeterminate]:border-accent-default data-[state=indeterminate]:bg-accent-default data-[state=indeterminate]:text-on-accent',
        'active:border-accent-active',
        'aria-invalid:border-danger-fg',
        'disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-2',
        'disabled:data-[state=checked]:bg-surface-3 disabled:data-[state=checked]:text-fg-disabled',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        {props.checked === 'indeterminate' ? (
          <MinusIcon className="size-3.5" />
        ) : (
          <CheckIcon className="size-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
