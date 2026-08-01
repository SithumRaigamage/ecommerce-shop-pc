import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { PriceSlider } from '@/components/PriceSlider'
import { Cluster, Stack } from '@/components/layout/primitives'
import {
  SPEC_FACETS,
  categoryOptions,
  facetOptions,
  specLabel,
  type ActiveFacets,
  type FacetOption,
} from '@/lib/catalogue'
import { formatLKR } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FilterOptions, Product } from '@/types'

interface FacetGroupProps {
  title: string
  options: FacetOption[]
  onToggle: (value: string) => void
  /** Long lists are capped; the rail should not become the page. */
  limit?: number
  /**
   * The rail is mounted twice — inline and inside the mobile sheet — so control
   * ids must be namespaced per instance. Without this both copies emit the same
   * id, `label[for]` resolves to whichever comes first in the document, and
   * every label in the sheet points at the hidden inline checkbox.
   */
  idPrefix: string
}

function FacetGroup({ title, options, onToggle, limit = 8, idPrefix }: FacetGroupProps) {
  if (options.length === 0) return null
  const visible = options.slice(0, limit)

  return (
    <Stack gap="tight" as="fieldset">
      <legend className="text-xs font-medium tracking-wide text-fg-tertiary uppercase">
        {title}
      </legend>
      {visible.map((option) => {
        const id = `${idPrefix}-${title}-${option.value}`.replace(/\s+/g, '-')
        // An option that would return nothing is disabled rather than hidden:
        // hiding it makes the rail flicker as you filter.
        const empty = option.count === 0 && !option.selected
        return (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={id}
              checked={option.selected}
              disabled={empty}
              onCheckedChange={() => onToggle(option.value)}
            />
            <Label
              htmlFor={id}
              className={cn('flex-1 font-normal', empty && 'text-fg-disabled')}
            >
              {option.label}
            </Label>
            <span
              className={cn('numeric text-xs', empty ? 'text-fg-disabled' : 'text-fg-tertiary')}
              data-numeric
            >
              {option.count}
            </span>
          </div>
        )
      })}
      {options.length > limit && (
        <p className="text-xs text-fg-tertiary">
          +{options.length - limit} more, narrow the category to see them
        </p>
      )}
    </Stack>
  )
}

interface FilterRailProps {
  /** Everything in the catalogue — counts are computed against this, not the result set. */
  products: Product[]
  facets: ActiveFacets
  filterOptions: FilterOptions | undefined
  onToggleList: (key: keyof ActiveFacets, value: string) => void
  onSetCategory: (value: string) => void
  onSetMaxPrice: (value: number | null) => void
  onClear: () => void
  hasActiveFacets: boolean
  loading?: boolean
  /**
   * The rail renders twice — inline from lg, and inside the mobile sheet. Only
   * one of them may carry the landmark, or assistive tech reports two identical
   * "Filters" regions. In the sheet, SheetTitle already names it.
   */
  labelled?: boolean
}

/**
 * The filter rail is the primary control surface of this page, not navigation
 * chrome — so it carries the category as a facet with counts rather than a
 * separate nav list, and every option states how many results it would yield.
 */
export function FilterRail({
  products,
  facets,
  filterOptions,
  onToggleList,
  onSetCategory,
  onSetMaxPrice,
  onClear,
  hasActiveFacets,
  loading = false,
  labelled = true,
}: FilterRailProps) {
  const idPrefix = useId()

  if (loading) {
    return (
      <Stack gap="gutter" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, group) => (
          <Stack key={group} gap="tight">
            <Skeleton className="h-3 w-20" />
            {Array.from({ length: 4 }).map((_, row) => (
              <Skeleton key={row} className="h-5 w-full" />
            ))}
          </Stack>
        ))}
      </Stack>
    )
  }

  const categories = categoryOptions(products, facets)
  const brands = facetOptions(products, facets, 'brand')
  const specKeys = (SPEC_FACETS[facets.category] ?? []) as (keyof ActiveFacets)[]
  const priceMax = filterOptions?.priceRange.max ?? 0

  return (
    <Stack
      gap="gutter"
      as={labelled ? 'section' : 'div'}
      aria-label={labelled ? 'Filters' : undefined}
    >
      <Cluster justify="between">
        <h2 className="text-sm font-medium text-fg-primary">Filters</h2>
        {hasActiveFacets && (
          <Button variant="link" size="sm" onClick={onClear} className="h-auto p-0">
            Clear all
          </Button>
        )}
      </Cluster>

      <FacetGroup
        idPrefix={idPrefix}
        title="Category"
        options={categories}
        limit={12}
        onToggle={(value) => onSetCategory(facets.category === value ? '' : value)}
      />

      <Separator />

      <Stack gap="tight">
        <Cluster justify="between">
          <span className="text-xs font-medium tracking-wide text-fg-tertiary uppercase">
            Max price
          </span>
          <span className="numeric text-xs text-fg-secondary" data-numeric>
            {formatLKR(facets.maxPrice ?? priceMax)}
          </span>
        </Cluster>
        <PriceSlider
          min={filterOptions?.priceRange.min ?? 0}
          max={priceMax}
          step={5000}
          value={facets.maxPrice ?? priceMax}
          onValueChange={(value) => onSetMaxPrice(value >= priceMax ? null : value)}
          label="Maximum price"
          valueText={formatLKR(facets.maxPrice ?? priceMax)}
        />
      </Stack>

      <Separator />

      <FacetGroup
        idPrefix={idPrefix}
        title="Brand"
        options={brands}
        onToggle={(value) => onToggleList('brand', value)}
      />

      {/* Spec facets appear only for categories that define them: a socket
          filter is meaningless on monitors. */}
      {specKeys.map((key) => (
        <FacetGroup
          key={key}
          idPrefix={idPrefix}
          title={specLabel(key)}
          options={facetOptions(products, facets, key as 'socket')}
          onToggle={(value) => onToggleList(key, value)}
        />
      ))}
    </Stack>
  )
}
