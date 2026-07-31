import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FilterSection } from '@/components/FilterSection'
import { ProductImage } from '@/components/ProductImage'
import { getFilterOptions, getProductsByCategory } from '@/lib/api'
import { formatLKR } from '@/lib/format'
import { useAsync } from '@/hooks/useAsync'

export default function ProductGrid() {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')

  const { data: products = [], loading } = useAsync(
    () => getProductsByCategory(category),
    [category],
  )
  const { data: filterOptions } = useAsync(getFilterOptions, [])

  const [maxPrice, setMaxPrice] = useState<number | undefined>()

  // Reset the slider to the full range whenever new filter bounds arrive.
  useEffect(() => {
    if (filterOptions) setMaxPrice(filterOptions.priceRange.max)
  }, [filterOptions])

  const visibleProducts = useMemo(
    () => (maxPrice === undefined ? products : products.filter((p) => p.price <= maxPrice)),
    [products, maxPrice],
  )

  return (
    <div className="space-y-8">
      {filterOptions && maxPrice !== undefined && (
        <FilterSection
          filterOptions={filterOptions}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
        />
      )}

      <section>
        <h1 className="mb-6 text-2xl font-bold capitalize">{category ?? 'All products'}</h1>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center">
            No products found{category ? ` in "${category}"` : ''}.
          </p>
        ) : (
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
                    <Link to={`/product-overview/${product.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
