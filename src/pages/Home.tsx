import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Headset, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductImage } from '@/components/ProductImage'
import { SIZES } from '@/lib/media'
import { ErrorState } from '@/components/ErrorState'
import { PriceDisplay } from '@/components/PriceDisplay'
import { getBanners, getCategories, getFeaturedProducts } from '@/lib/api'
import { formatLKR } from '@/lib/format'
import { iconFromFaClass } from '@/lib/icons'
import { useAsync } from '@/hooks/useAsync'
import { cn } from '@/lib/utils'

const AUTO_SCROLL_MS = 5000

/**
 * `banner.json` ships a Tailwind gradient class per slide and
 * `featuredProducts.json` ships a badge colour. Both are raw palette strings
 * chosen for decoration, which the design system does not allow: gradients are
 * ruled out entirely and colour has to carry meaning.
 *
 * The gradient is dropped — it sat behind a full-bleed photo and was never
 * visible. The badge colour is ignored in favour of a tone derived from the
 * badge's own text, so "Sale" reads as a status and everything else stays
 * neutral. See DESIGN.md §8.
 */
function badgeTone(text: string): string {
  const normalized = text.trim().toLowerCase()
  if (normalized === 'sale') {
    return 'border-success-border bg-success-bg text-success-fg'
  }
  return 'border-border-subtle bg-surface-2 text-fg-secondary'
}

const WHY_CHOOSE_US = [
  { icon: Truck, title: 'Fast Shipping', copy: 'Free delivery for orders over $500' },
  { icon: ShieldCheck, title: 'Secure Payments', copy: '100% secure payment methods' },
  { icon: Headset, title: '24/7 Support', copy: 'Dedicated support anytime' },
  { icon: RotateCcw, title: 'Easy Returns', copy: '30-day return policy' },
]

function HeroBanner() {
  const { data: banners = [], loading, error, retry } = useAsync(getBanners, [])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setIndex((i) => (banners.length ? (i + 1) % banners.length : 0))
  }, [banners.length])

  const prev = () => {
    setIndex((i) => (banners.length ? (i - 1 + banners.length) % banners.length : 0))
  }

  useEffect(() => {
    if (paused || banners.length <= 1) return
    const id = setInterval(next, AUTO_SCROLL_MS)
    return () => clearInterval(id)
  }, [paused, banners.length, next])

  if (error) {
    return <ErrorState size="sm" description="Promotions could not be loaded." onRetry={retry} />
  }
  if (loading) {
    return <Skeleton className="h-125 w-full rounded-lg" />
  }
  if (banners.length === 0) return null

  const current = banners[index]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      className="relative overflow-hidden rounded-lg border border-border-subtle bg-surface-1"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex flex-col lg:h-125 lg:flex-row">
        <div className="relative h-64 w-full overflow-hidden bg-surface-2 lg:h-auto lg:w-3/5">
          <img
            key={current.image}
            src={current.image}
            alt=""
            className="size-full object-cover duration-slow ease-standard transition-transform hover:scale-105"
          />
          <Button
            variant="secondary"
            size="icon"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full opacity-90"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={next}
            aria-label="Next slide"
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full opacity-90"
          >
            <ChevronRight />
          </Button>
        </div>

        <div className="flex w-full flex-col justify-center gap-4 p-8 text-center lg:w-2/5 lg:p-12 lg:text-left">
          {current.title && (
            <h2 className="font-display text-4xl leading-tight font-semibold text-fg-primary lg:text-5xl">{current.title}</h2>
          )}
          {current.subtitle && (
            <p className="text-fg-tertiary text-lg lg:text-xl">{current.subtitle}</p>
          )}
          {current.buttonLink && (
            <div>
              <Button asChild size="lg" variant="outline" className="mt-2">
                <Link
                  to={{
                    pathname: current.buttonLink,
                    search: current.category ? `?category=${encodeURIComponent(current.category)}` : '',
                  }}
                >
                  {current.buttonText}
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-4 flex justify-center gap-2 lg:justify-start">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  'focus-ring size-3 rounded-full border-2 border-border-strong duration-fast ease-standard transition-colors',
                  i === index ? 'border-accent-default bg-accent-default' : 'bg-transparent',
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CategoriesOverview() {
  const { data: categories = [], loading, error, retry } = useAsync(getCategories, [])

  return (
    <section className="py-16">
      <h2 className="mb-8 text-center font-display text-3xl font-semibold text-fg-primary">Shop by Featured Categories</h2>
      {error && (
        <ErrorState size="sm" description="Categories could not be loaded." onRetry={retry} />
      )}
      {loading && (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = iconFromFaClass(category.icon)
          return (
            <Link key={category.id} to={`/product-grid?category=${encodeURIComponent(category.slug)}`}>
              <Card interactive className="h-full text-center">
                <CardContent className="flex flex-col items-center gap-2">
                  <Icon className="size-9 text-fg-tertiary" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-fg-primary">{category.name}</h3>
                  <span className="text-fg-tertiary text-sm">
                    Starting from {formatLKR(category.startingPrice)}
                  </span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function FeaturedProducts() {
  const { data: products = [], loading, error, retry } = useAsync(getFeaturedProducts, [])

  return (
    <section className="py-16">
      <h2 className="mb-8 font-display text-3xl font-semibold text-fg-primary">Featured Products</h2>
      {error && (
        <ErrorState size="sm" description="Featured products could not be loaded." onRetry={retry} />
      )}
      {loading && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-lg" />
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="group overflow-hidden pt-0 transition-shadow hover:shadow-xl">
            <div className="relative overflow-hidden">
              <ProductImage
                assetId={product.productId}
                alt={product.name}
                category={product.category}
                sizes={SIZES.featured}
                className="h-64 w-full duration-base ease-standard transition-transform group-hover:scale-105"
              />
              {product.badge && (
                <span
                  className={cn(
                    'absolute top-4 right-4 rounded-xs border px-2 py-0.5 text-xs font-medium',
                    badgeTone(product.badge.text),
                  )}
                >
                  {product.badge.text}
                </span>
              )}
            </div>
            <CardContent>
              <h3 className="mb-2 line-clamp-2 text-xl font-semibold text-fg-primary duration-fast ease-standard transition-colors group-hover:text-accent-default">
                {product.name}
              </h3>
              <p className="text-fg-tertiary mb-4 line-clamp-2">{product.description}</p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <PriceDisplay value={product.price} compareAt={product.oldPrice} showDelta />
                </div>
                <Button asChild>
                  <Link to={`/product-overview/${product.productId}`}>Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div>
      <HeroBanner />
      <CategoriesOverview />
      <FeaturedProducts />

      <section className="py-16">
        <h2 className="mb-12 text-center font-display text-3xl font-semibold text-fg-primary">Why Choose Us</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE_US.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="text-center">
              <div className="mb-4 inline-flex rounded-full border border-border-subtle bg-surface-2 p-4">
                <Icon className="size-8 text-fg-tertiary" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{title}</h3>
              <p className="text-fg-tertiary">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border-subtle bg-surface-1 px-4 py-16 text-center">
        <h2 className="mb-4 font-display text-3xl font-semibold text-fg-primary">Stay Updated</h2>
        <p className="mb-8 text-fg-tertiary">
          Subscribe to our newsletter for the latest products and exclusive offers
        </p>
        <form
          className="mx-auto flex max-w-md gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <Input
            type="email"
            required
            placeholder="Enter your email"
            aria-label="Email address"
            className="flex-1"
          />
          <Button type="submit">Subscribe</Button>
        </form>
      </section>
    </div>
  )
}
