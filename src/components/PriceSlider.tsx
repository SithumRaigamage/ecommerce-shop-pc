import { Slider as SliderPrimitive } from 'radix-ui'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface PriceSliderProps {
  id?: string
  min: number
  max: number
  step?: number
  value: number
  onValueChange: (value: number) => void
  /**
   * Accessible name. Radix puts `role="slider"` on the *thumb*, and props passed
   * to the Root stay on the Root — so a label given to a wrapper never reaches
   * the element that carries the role. This component composes the Radix
   * primitives directly to place the label where assistive tech reads it.
   */
  label: string
  /** Human-readable current value, announced instead of the raw number. */
  valueText?: string
  disabled?: boolean
  /** Renders a skeleton track: a spinner on a slider communicates nothing. */
  loading?: boolean
  className?: string
}

export function PriceSlider({
  id,
  min,
  max,
  step = 1,
  value,
  onValueChange,
  label,
  valueText,
  disabled,
  loading = false,
  className,
}: PriceSliderProps) {
  if (loading) {
    return (
      <div className={cn('flex w-full items-center', className)}>
        <Skeleton
          role="status"
          aria-label={`${label} loading`}
          aria-hidden={undefined}
          className="h-1.5 w-full rounded-full"
        />
      </div>
    )
  }

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      id={id}
      min={min}
      max={max}
      step={step}
      value={[value]}
      disabled={disabled}
      onValueChange={([next]) => onValueChange(next)}
      className={cn(
        'group/slider relative flex w-full touch-none items-center select-none',
        'data-[disabled]:cursor-not-allowed',
        className,
      )}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-surface-3 group-data-[disabled]/slider:bg-surface-2"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full bg-accent-default group-data-[disabled]/slider:bg-fg-disabled"
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        aria-label={label}
        aria-valuetext={valueText}
        className={cn(
          'focus-ring block size-4 shrink-0 rounded-full border-2 border-accent-default bg-bg',
          'duration-fast ease-standard transition',
          'hover:border-accent-hover active:scale-95 active:border-accent-active',
          'disabled:cursor-not-allowed disabled:border-fg-disabled disabled:bg-surface-2',
        )}
      />
    </SliderPrimitive.Root>
  )
}
