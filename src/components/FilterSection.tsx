import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { PriceSlider } from '@/components/PriceSlider'
import { formatLKR } from '@/lib/format'
import type { FilterOptions } from '@/types'

interface FilterSectionProps {
  filterOptions: FilterOptions
  maxPrice: number
  onMaxPriceChange: (value: number) => void
}

export function FilterSection({ filterOptions, maxPrice, onMaxPriceChange }: FilterSectionProps) {
  const { min, max } = filterOptions.priceRange

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-xl">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor="priceRange" className="mb-2 block">
          Price Range
        </Label>
        <div className="max-w-md">
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>Min: {formatLKR(min)}</span>
            <span>Up to: {formatLKR(maxPrice)}</span>
          </div>
          <PriceSlider
            id="priceRange"
            className="mt-3"
            min={min}
            max={max}
            step={1000}
            value={maxPrice}
            onValueChange={onMaxPriceChange}
            label="Maximum price"
            valueText={formatLKR(maxPrice)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
