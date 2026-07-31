import { Slider as SliderPrimitive } from 'radix-ui'
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
   * to the Root stay on the Root — so a label given to shadcn's `<Slider>`
   * never reaches the element that carries the role. This component composes the
   * Radix primitives directly to place the label where assistive tech reads it.
   *
   * Deliberately not a patch to `components/ui/slider.tsx`: that file is
   * generated, and `shadcn add slider --overwrite` would silently drop it.
   */
  label: string
  /** Human-readable current value, announced instead of the raw number. */
  valueText?: string
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
  className,
}: PriceSliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      id={id}
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={([next]) => onValueChange(next)}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50',
        className,
      )}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-muted relative h-1.5 w-full grow overflow-hidden rounded-full"
      >
        <SliderPrimitive.Range data-slot="slider-range" className="bg-primary absolute h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        aria-label={label}
        aria-valuetext={valueText}
        className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  )
}
