import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { CircleIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/** `loading` disables the whole group and marks it busy; items show Skeletons. */
function RadioGroup({
  className,
  loading = false,
  disabled,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root> & { loading?: boolean }) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={cn('grid gap-stack-tight', className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  loading = false,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & { loading?: boolean }) {
  if (loading) {
    return (
      <Skeleton
        role="status"
        aria-label="Loading"
        aria-hidden={undefined}
        className={cn('size-4 rounded-full', className)}
      />
    )
  }

  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'focus-ring aspect-square size-4 shrink-0 rounded-full border border-border-strong bg-surface-1',
        'duration-fast ease-standard transition-colors',
        'hover:border-accent-default',
        'data-[state=checked]:border-accent-default data-[state=checked]:text-accent-default',
        'active:border-accent-active',
        'aria-invalid:border-danger-fg',
        'disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-2 disabled:data-[state=checked]:text-fg-disabled',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="size-2 fill-current stroke-none" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
