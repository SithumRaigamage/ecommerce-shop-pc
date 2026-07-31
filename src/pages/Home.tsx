import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Headset, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductImage } from '@/components/ProductImage'
import { LoadError } from '@/components/LoadError'
import { getBanners, getCategories, getFeaturedProducts } from '@/lib/api'
import { formatLKR } from '@/lib/format'
import { iconFromFaClass } from '@/lib/icons'
import { useAsync } from '@/hooks/useAsync'
import { cn } from '@/lib/utils'

const AUTO_SCROLL_MS = 5000

/**
 * banner.json / featuredProducts.json ship Tailwind class strings. Tailwind only
 * emits classes it can see in source, so map the data values onto literal classes.
 */
const BANNER_GRADIENTS: Record<string, string> = {
  'bg-gradient-to-r from-purple-900 to-indigo-800': 'bg-linear-to-r from-purple-900 to-indigo-800',
  'bg-gradient-to-r from-green-900 to-emerald-800': 'bg-linear-to-r from-green-900 to-emerald-800',
  'bg-gradient-to-r from-blue-900 to-cyan-800': 'bg-linear-to-r from-blue-900 to-cyan-800',
  'bg-gradient-to-r from-red-900 to-orange-800': 'bg-linear-to-r from-red-900 to-orange-800',
  'bg-gradient-to-r from-yellow-900 to-amber-800': 'bg-linear-to-r from-yellow-900 to-amber-800',
}

const BADGE_COLORS: Record<string, string> = {
  'bg-red-500': 'bg-red-500',
  'bg-green-500': 'bg-green-500',
  'bg-purple-500': 'bg-purple-500',
  'bg-yellow-500': 'bg-yellow-500',
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
    return <LoadError message="Promotions could not be loaded." onRetry={retry} />
  }
  if (loading) {
    return <Skeleton className="h-[60vh] w-full rounded-xl" />
  }
  if (banners.length === 0) return null

  const current = banners[index]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      className="bg-card relative overflow-hidden rounded-xl border"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex flex-col lg:h-[60vh] lg:min-h-[420px] lg:flex-row">
        <div
          className={cn(
            'relative h-64 w-full overflow-hidden lg:h-auto lg:w-3/5',
            BANNER_GRADIENTS[current.backgroundColor] ?? 'bg-muted',
          )}
        >
          <img
            key={current.image}
            src={current.image}
            alt=""
            className="size-full object-cover transition-transform duration-700 hover:scale-105"
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
            <h2 className="text-4xl leading-tight font-bold lg:text-5xl">{current.title}</h2>
          )}
          {current.subtitle && (
            <p className="text-muted-foreground text-lg lg:text-xl">{current.subtitle}</p>
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
                  'border-primary size-3 rounded-full border-2 transition-colors',
                  i === index ? 'bg-primary' : 'bg-transparent',
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
      <h2 className="mb-8 text-center text-3xl font-bold">Shop by Featured Categories</h2>
      {error && <LoadError message="Categories could not be loaded." onRetry={retry} />}
      {loading && (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = iconFromFaClass(category.icon)
          return (
            <Link key={category.id} to={`/product-grid?category=${encodeURIComponent(category.slug)}`}>
              <Card className="h-full text-center transition-shadow hover:shadow-xl">
                <CardContent className="flex flex-col items-center gap-2">
                  <Icon className="text-primary size-9" aria-hidden="true" />
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <span className="text-muted-foreground text-sm">
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
      <h2 className="mb-8 text-3xl font-bold">Featured Products</h2>
      {error && <LoadError message="Featured products could not be loaded." onRetry={retry} />}
      {loading && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="group overflow-hidden pt-0 transition-shadow hover:shadow-xl">
            <div className="relative overflow-hidden">
              <ProductImage
                src={product.image}
                alt={product.name}
                className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {product.badge && (
                <span
                  className={cn(
                    'absolute top-4 right-4 rounded px-2 py-1 text-sm font-medium text-white',
                    BADGE_COLORS[product.badge.color] ?? 'bg-primary',
                  )}
                >
                  {product.badge.text}
                </span>
              )}
            </div>
            <CardContent>
              <h3 className="group-hover:text-primary mb-2 line-clamp-2 text-xl font-semibold transition-colors">
                {product.name}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-primary text-2xl font-bold">{formatLKR(product.price)}</span>
                  {product.oldPrice && (
                    <span className="text-muted-foreground ml-2 text-sm line-through">
                      {formatLKR(product.oldPrice)}
                    </span>
                  )}
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
        <h2 className="mb-12 text-center text-3xl font-bold">Why Choose Us</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE_US.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="text-center">
              <div className="bg-primary/10 mb-4 inline-flex rounded-full p-4">
                <Icon className="text-primary size-8" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{title}</h3>
              <p className="text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground rounded-xl px-4 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold">Stay Updated</h2>
        <p className="mb-8 opacity-90">
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
            className="bg-background text-foreground flex-1"
          />
          <Button type="submit" variant="secondary">
            Subscribe
          </Button>
        </form>
      </section>
    </div>
  )
}
