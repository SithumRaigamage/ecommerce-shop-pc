import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { FilterChip } from '@/components/FilterChip'
import { FilterSection } from '@/components/FilterSection'
import { PriceDisplay } from '@/components/PriceDisplay'
import { ProductImage } from '@/components/ProductImage'
import { StatBadge } from '@/components/StatBadge'
import { getFilterOptions, getProductsByCategory } from '@/lib/api'
import { CATALOGUE_FACETS } from '@/lib/facets'
import { CATEGORY_SPEC_FIELDS } from '@/lib/catalogue-schema'
import { categoryLabel } from '@/lib/categories'
import { formatLKR } from '@/lib/format'
import { useAsync } from '@/hooks/useAsync'
import { useFacets } from '@/hooks/useFacets'
import type { Product } from '@/types'

/** Units for the spec keys surfaced on a card. */
const SPEC_UNITS: Record<string, string> = {
  tdp: 'W',
  vram_gb: 'GB',
  length_mm: 'mm',
  wattage: 'W',
  speed: 'MT/s',
  read_mbs: 'MB/s',
  size: '"',
  refresh: 'Hz',
  max_gpu_mm: 'mm',
  max_cooler_mm: 'mm',
}

const SPEC_LABELS: Record<string, string> = {
  socket: 'Socket',
  cores: 'Cores',
  tdp: 'TDP',
  vram_gb: 'VRAM',
  chipset: 'Chipset',
  form_factor: 'Form',
  type: 'Type',
  speed: 'Speed',
  capacity: 'Capacity',
  wattage: 'Watts',
  efficiency: 'Rating',
  interface: 'Interface',
  read_mbs: 'Read',
  size: 'Size',
  resolution: 'Res',
  refresh: 'Refresh',
  panel: 'Panel',
  max_gpu_mm: 'Max GPU',
}

/** The two most identifying specs for a category, for the card badges. */
function headlineSpecs(product: Product): { key: string; value: string | number }[] {
  const keys = CATEGORY_SPEC_FIELDS[product.category] ?? []
  return keys
    .slice(0, 2)
    .map((key) => ({ key, value: product.specs?.[key] as string | number }))
    .filter((s) => s.value !== undefined && s.value !== null && !Array.isArray(s.value))
}

export default function ProductGrid() {
  const [facets, setFacets] = useFacets(CATALOGUE_FACETS)
  const { category, maxPrice } = facets

  const {
    data: products = [],
    loading,
    error,
    retry,
  } = useAsync(() => getProductsByCategory(category), [category])

  const {
    data: filterOptions,
    error: filterError,
    retry: retryFilters,
  } = useAsync(getFilterOptions, [])

  const visibleProducts = useMemo(
    () => (maxPrice === null ? products : products.filter((p) => p.price <= maxPrice)),
    [products, maxPrice],
  )

  const heading = categoryLabel(category) ?? (category || 'All products')
  const hasFacets = Boolean(category) || maxPrice !== null

  function renderProducts() {
    if (error) {
      return (
        <ErrorState
          description="Products could not be loaded. The catalogue service did not respond."
          onRetry={retry}
        />
      )
    }

    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      )
    }

    if (visibleProducts.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title={`No products found${category ? ` in "${heading}"` : ''}.`}
          description="Try widening the price range or clearing a filter."
          action={
            hasFacets ? (
              <Button size="sm" onClick={() => setFacets({ category: '', maxPrice: null })}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )
    }

    return (
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <Card key={product.id} className="group flex flex-col overflow-hidden pt-0">
            <div className="overflow-hidden bg-surface-2">
              <ProductImage
                src={product.image}
                alt={product.title}
                className="h-56 w-full object-contain duration-base ease-standard transition-transform group-hover:scale-105"
              />
            </div>
            <CardContent className="flex flex-1 flex-col gap-stack-tight">
              <p className="text-xs text-fg-tertiary">{product.brand}</p>
              <h2 className="line-clamp-2 text-base font-medium text-fg-primary">
                {product.title}
              </h2>

              {headlineSpecs(product).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {headlineSpecs(product).map((spec) => (
                    <StatBadge
                      key={spec.key}
                      size="sm"
                      label={SPEC_LABELS[spec.key] ?? spec.key}
                      value={spec.value}
                      unit={SPEC_UNITS[spec.key]}
                    />
                  ))}
                </div>
              )}

              <PriceDisplay value={product.price} className="mt-auto pt-stack-tight" />

              <Button asChild className="w-full">
                <Link to={`/product-overview/${product.id}`}>
                  View Details<span className="sr-only"> for {product.title}</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  function renderFilters() {
    if (filterError) {
      return (
        <ErrorState
          size="sm"
          title="Filters unavailable"
          description="Filters could not be loaded."
          onRetry={retryFilters}
        />
      )
    }
    if (!filterOptions) return null
    return (
      <FilterSection
        filterOptions={filterOptions}
        maxPrice={maxPrice ?? filterOptions.priceRange.max}
        onMaxPriceChange={(value) => setFacets({ maxPrice: value })}
      />
    )
  }

  return (
    <div className="flex flex-col gap-gutter">
      {renderFilters()}

      {hasFacets && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-tertiary">Active filters</span>
          {category && (
            <FilterChip
              label="Category"
              value={heading}
              onRemove={() => setFacets({ category: '' })}
            />
          )}
          {maxPrice !== null && (
            <FilterChip
              label="Max price"
              value={formatLKR(maxPrice)}
              onRemove={() => setFacets({ maxPrice: null })}
            />
          )}
        </div>
      )}

      <section>
        <h1 className="mb-gutter font-display text-2xl font-semibold text-fg-primary">{heading}</h1>
        {renderProducts()}
      </section>
    </div>
  )
}
