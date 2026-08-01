import { useMemo } from 'react'
import { LayoutGrid, Rows3, SearchX, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { FilterChip } from '@/components/FilterChip'
import { Cluster, Container, Grid, GridItem, Stack } from '@/components/layout/primitives'
import { CompareTray } from '@/components/catalogue/CompareTray'
import { FilterRail } from '@/components/catalogue/FilterRail'
import { ProductCard, ProductCardSkeleton } from '@/components/catalogue/ProductCard'
import { ProductTable, ProductTableSkeleton } from '@/components/catalogue/ProductTable'
import { getAllProducts, getFilterOptions } from '@/lib/api'
import {
  MAX_COMPARE,
  activeFacetChips,
  applyFacets,
  relaxationHint,
  sortOptionsFor,
  sortProducts,
  type ActiveFacets,
} from '@/lib/catalogue'
import { categoryLabel } from '@/lib/categories'
import { CATALOGUE_FACETS } from '@/lib/facets'
import { useAsync } from '@/hooks/useAsync'
import { useFacets } from '@/hooks/useFacets'

const SKELETON_CARDS = 12

export default function ProductGrid() {
  const [facets, setFacets] = useFacets(CATALOGUE_FACETS)
  const { category, density, sort, compare } = facets

  // The whole catalogue, not a filtered request: facet counts have to be
  // computed against everything, otherwise a count can never grow back.
  const { data: allProducts = [], loading, error, retry } = useAsync(getAllProducts, [])
  const { data: filterOptions, error: filterError, retry: retryFilters } = useAsync(
    getFilterOptions,
    [],
  )

  const active: ActiveFacets = facets
  const results = useMemo(() => applyFacets(allProducts, active), [allProducts, active])
  const sorted = useMemo(() => sortProducts(results, sort), [results, sort])
  const chips = useMemo(() => activeFacetChips(active), [active])
  const compareProducts = useMemo(
    () => compare.map((id) => allProducts.find((p) => p.id === id)).filter((p) => p !== undefined),
    [compare, allProducts],
  )

  // Identity of the current query. Re-filtering replays the results fade; a
  // re-render that changed nothing does not.
  const resultsKey = useMemo(
    () => JSON.stringify([active, sort, density, loading, Boolean(error)]),
    [active, sort, density, loading, error],
  )

  const heading = categoryLabel(category) ?? 'All products'
  const compact = density === 'compact'
  const compareFull = compare.length >= MAX_COMPARE

  const toggleList = (key: keyof ActiveFacets, value: string) => {
    const current = active[key] as string[]
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    setFacets({ [key]: next } as Partial<typeof facets>)
  }

  const removeChip = (key: keyof ActiveFacets, value: string) => {
    if (key === 'category') return setFacets({ category: '' })
    if (key === 'maxPrice') return setFacets({ maxPrice: null })
    toggleList(key, value)
  }

  const clearAll = () =>
    setFacets({
      category: '',
      maxPrice: null,
      brand: [],
      socket: [],
      chipset: [],
      form_factor: [],
      type: [],
      efficiency: [],
      modular: [],
      interface: [],
      panel: [],
      resolution: [],
    })

  const toggleCompare = (id: string) => {
    if (compare.includes(id)) return setFacets({ compare: compare.filter((c) => c !== id) })
    if (compareFull) return
    setFacets({ compare: [...compare, id] })
  }

  const railProps = {
    products: allProducts,
    facets: active,
    filterOptions,
    onToggleList: toggleList,
    onSetCategory: (value: string) => setFacets({ category: value }),
    onSetMaxPrice: (value: number | null) => setFacets({ maxPrice: value }),
    onClear: clearAll,
    hasActiveFacets: chips.length > 0,
    loading,
  }

  function renderResults() {
    if (error) {
      return (
        <ErrorState
          description="Products could not be loaded. The catalogue service did not respond."
          onRetry={retry}
        />
      )
    }

    if (loading) {
      return compact ? (
        <ProductTableSkeleton category={category} />
      ) : (
        <Grid cols={1} sm={2} lg={2} xl={3} xxl={4} gap="gutter">
          {Array.from({ length: SKELETON_CARDS }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </Grid>
      )
    }

    if (sorted.length === 0) {
      const hint = relaxationHint(allProducts, active)
      return (
        <EmptyState
          icon={SearchX}
          title="No products match these filters"
          // Naming the specific filter, and what relaxing it recovers, turns a
          // dead end into one obvious next action.
          description={
            hint
              ? `Relaxing ${hint.label} would show ${hint.recovered} product${hint.recovered === 1 ? '' : 's'}.`
              : 'Try clearing a filter.'
          }
          action={
            hint ? (
              <Button size="sm" onClick={() => removeChip(hint.key, '')}>
                Clear {hint.label}
              </Button>
            ) : undefined
          }
          secondaryAction={
            chips.length > 1 ? (
              <Button size="sm" variant="ghost" onClick={clearAll}>
                Clear all filters
              </Button>
            ) : undefined
          }
        />
      )
    }

    return compact ? (
      <ProductTable
        products={sorted}
        category={category}
        sort={sort}
        onSort={(next) => setFacets({ sort: next })}
        compare={compare}
        onToggleCompare={toggleCompare}
        compareDisabled={compareFull}
      />
    ) : (
      <Grid cols={1} sm={2} lg={2} xl={3} xxl={4} gap="gutter">
        {sorted.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            selected={compare.includes(product.id)}
            onToggleCompare={toggleCompare}
            compareDisabled={compareFull}
          />
        ))}
      </Grid>
    )
  }

  return (
    // The tray is sticky, so the scroll container needs room for it or the last
    // row sits underneath and its controls cannot be clicked.
    <Container
      size="catalogue"
      className={compareProducts.length > 0 ? 'pb-40 sm:pb-24' : undefined}
    >
      <Grid cols={12} gap="gutter" className="items-start">
        {/* Rail: inline from lg, a sheet below it. */}
        <GridItem span={12} lg={4} xl={3} xxl={2} className="hidden lg:block">
          <div className="sticky top-22 max-h-sidebar overflow-y-auto pr-2">
            {filterError ? (
              <ErrorState
                size="sm"
                title="Filters unavailable"
                description="Facets could not be loaded."
                onRetry={retryFilters}
              />
            ) : (
              <FilterRail {...railProps} />
            )}
          </div>
        </GridItem>

        <GridItem span={12} lg={8} xl={9} xxl={10}>
          <Stack gap="gutter">
            <Cluster justify="between" gap="default">
              <Stack gap="tight">
                <h1 className="font-display text-2xl font-semibold text-fg-primary">{heading}</h1>
                {/*
                  The count is the filter's confirmation, so it is also the
                  announcement. Screen reader users get the result of a facet
                  click here; sighted users get the same number in the same
                  place. Polite, because filtering is never urgent.
                */}
                <p className="text-sm text-fg-tertiary" aria-live="polite" aria-atomic="true">
                  {loading ? (
                    <>
                      <span className="numeric" data-numeric>
                        —
                      </span>{' '}
                      products
                    </>
                  ) : (
                    <>
                      <span className="numeric" data-numeric>
                        {sorted.length}
                      </span>{' '}
                      {sorted.length === 1 ? 'product' : 'products'}
                    </>
                  )}
                </p>
              </Stack>

              <Cluster gap="tight">
                {/* Filters on mobile, where the rail is hidden. */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal />
                      Filters
                      {chips.length > 0 && (
                        <span className="numeric" data-numeric>
                          ({chips.length})
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="px-card-padding pb-card-padding">
                      <FilterRail {...railProps} labelled={false} />
                    </div>
                  </SheetContent>
                </Sheet>

                <Label htmlFor="sort" className="sr-only">
                  Sort by
                </Label>
                <Select value={sort} onValueChange={(value) => setFacets({ sort: value })}>
                  <SelectTrigger id="sort" className="w-48">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptionsFor(category).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Density: browsing vs comparing, the page's core distinction. */}
                <div
                  role="group"
                  aria-label="Result density"
                  className="flex items-center gap-0.5 rounded-md border border-border-subtle bg-surface-2 p-0.5"
                >
                  <Button
                    size="sm"
                    variant={compact ? 'ghost' : 'secondary'}
                    aria-pressed={!compact}
                    onClick={() => setFacets({ density: 'comfortable' })}
                  >
                    <LayoutGrid />
                    <span className="sr-only sm:not-sr-only">Comfortable</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={compact ? 'secondary' : 'ghost'}
                    aria-pressed={compact}
                    onClick={() => setFacets({ density: 'compact' })}
                  >
                    <Rows3 />
                    <span className="sr-only sm:not-sr-only">Compact</span>
                  </Button>
                </div>
              </Cluster>
            </Cluster>

            {chips.length > 0 && (
              <Cluster gap="tight" aria-label="Active filters">
                {chips.map((chip) => (
                  <FilterChip
                    key={`${chip.key}-${chip.value}`}
                    label={chip.label}
                    value={chip.value}
                    onRemove={() => removeChip(chip.key, chip.value)}
                  />
                ))}
                <Button variant="link" size="sm" onClick={clearAll} className="h-auto p-0">
                  Clear all
                </Button>
              </Cluster>
            )}

            {/*
              Skeleton and results are the same slot, and ProductCardSkeleton
              shares ProductCard's geometry exactly, so this fade is a crossfade
              with no reflow underneath it — nothing pops into place.
            */}
            <div key={resultsKey} className="animate-fade-quick">
              {renderResults()}
            </div>
          </Stack>
        </GridItem>
      </Grid>

      <CompareTray
        products={compareProducts}
        onRemove={(id) => setFacets({ compare: compare.filter((c) => c !== id) })}
        onClear={() => setFacets({ compare: [] })}
      />
    </Container>
  )
}
