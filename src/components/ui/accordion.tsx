import { Accordion as AccordionPrimitive } from 'radix-ui'
import { ChevronDownIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/** `loading` draws collapsed placeholder rows; `loadingRows` sets how many. */
function Accordion({
  loading = false,
  loadingRows = 3,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root> & {
  loading?: boolean
  loadingRows?: number
}) {
  if (loading) {
    return (
      <div role="status" aria-label="Loading" className="flex flex-col">
        {Array.from({ length: loadingRows }).map((_, i) => (
          <div key={i} className="border-b border-border-subtle py-4 last:border-b-0">
            <Skeleton className="h-5 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-border-subtle last:border-b-0', className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/trigger focus-ring flex flex-1 items-start justify-between gap-4 py-4 text-left text-sm font-medium',
          'duration-fast ease-standard transition-colors',
          'text-fg-primary hover:text-accent-default',
          'disabled:pointer-events-none disabled:text-fg-disabled',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          className={cn(
            'pointer-events-none size-4 shrink-0 translate-y-0.5 text-fg-tertiary',
            'duration-base ease-standard transition-transform',
            'group-data-[state=open]/trigger:rotate-180',
          )}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        'overflow-hidden text-sm text-fg-secondary',
        'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      )}
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
