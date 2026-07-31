import { cn } from '@/lib/utils'

const STEPS = ['Cart review', 'Billing', 'Confirmation']

interface CheckoutStepsProps {
  /** 1-based index of the active step. */
  current: 1 | 2 | 3
}

export function CheckoutSteps({ current }: CheckoutStepsProps) {
  return (
    <ol className="relative mb-12 flex items-center justify-between">
      <div className="absolute top-5 right-0 left-0 border-t-2 border-dashed" aria-hidden="true" />
      {STEPS.map((label, i) => {
        const step = i + 1
        const active = step === current
        return (
          <li key={label} className="relative z-10 flex flex-col items-center gap-2">
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-full border text-lg shadow',
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground',
              )}
              aria-current={active ? 'step' : undefined}
            >
              {step}
            </span>
            <span className="text-muted-foreground text-xs">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
