import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FilterSection } from '@/components/FilterSection'
import { ProductImage } from '@/components/ProductImage'
import { LoadError } from '@/components/LoadError'
import { getFilterOptions, getProductsByCategory } from '@/lib/api'
import { CATALOGUE_FACETS } from '@/lib/facets'
import { categoryLabel } from '@/lib/categories'
import { formatLKR } from '@/lib/format'
import { useAsync } from '@/hooks/useAsync'
import { useFacets } from '@/hooks/useFacets'

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

  function renderProducts() {
    if (error) return <LoadError message="Products could not be loaded." onRetry={retry} />

    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      )
    }

    if (visibleProducts.length === 0) {
      return (
        <p className="text-muted-foreground py-12 text-center">
          No products found{category ? ` in "${heading}"` : ''}.
        </p>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <Card key={product.id} className="group overflow-hidden pt-0">
            <div className="bg-muted/30 overflow-hidden">
              <ProductImage
                src={product.image}
                alt={product.title}
                className="h-56 w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <CardContent className="flex flex-col gap-3 text-center">
              <h2 className="line-clamp-2 text-lg font-medium">{product.title}</h2>
              <p className="text-primary text-xl font-semibold">{formatLKR(product.price)}</p>
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
      return <LoadError message="Filters could not be loaded." onRetry={retryFilters} />
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
    <div className="space-y-8">
      {renderFilters()}

      <section>
        <h1 className="mb-6 text-2xl font-bold">{heading}</h1>
        {renderProducts()}
      </section>
    </div>
  )
}
