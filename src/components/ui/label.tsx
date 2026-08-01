import { Label as LabelPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium text-fg-secondary select-none',
        // Follows the control it labels into the disabled state.
        'group-data-[disabled=true]:text-fg-disabled peer-disabled:text-fg-disabled peer-disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
