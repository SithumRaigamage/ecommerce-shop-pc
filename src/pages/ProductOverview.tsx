import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heart, Minus, PackageSearch, Plus, Share2, Star } from 'lucide-react'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductImage } from '@/components/ProductImage'
import { ErrorState } from '@/components/ErrorState'
import { EmptyState } from '@/components/EmptyState'
import { PriceDisplay } from '@/components/PriceDisplay'
import { SpecTable } from '@/components/SpecTable'
import { getProductById } from '@/lib/api'
import { specRowsFrom } from '@/lib/specs'
import { cn } from '@/lib/utils'
import { useAsync } from '@/hooks/useAsync'
import { useCartStore } from '@/store/cart'
import type { Size } from '@/types'

/** Units for the catalogue's spec keys, so SpecTable can align them. */
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

export default function ProductOverview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addToCart = useCartStore((state) => state.addToCart)

  const { data: product, loading, error, retry } = useAsync(() => getProductById(id ?? ''), [id])

  const [selectedImage, setSelectedImage] = useState<string | null>()
  const [selectedColor, setSelectedColor] = useState<string>()
  const [selectedSize, setSelectedSize] = useState<Size>()
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  // Seed the selections from the product once it resolves, as ngOnInit did.
  useEffect(() => {
    if (!product) return
    setSelectedImage(product.image)
    setSelectedColor(product.colors?.[0])
    setSelectedSize(product.sizes?.[0])
    setQuantity(1)
  }, [product])

  if (error) {
    return (
      <ErrorState
        headingLevel={1}
        description="This product could not be loaded."
        onRetry={retry}
      />
    )
  }

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-112 rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <EmptyState
        icon={PackageSearch}
        headingLevel={1}
        title="Product not found"
        description={`We couldn't find a product with the id "${id}".`}
        action={<Button onClick={() => navigate('/product-grid')}>Browse products</Button>}
      />
    )
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Product URL copied to clipboard!')
    } catch {
      toast.error('Failed to copy URL.')
    }
  }

  const handleAddToCart = () => {
    if (product.colors?.length && !selectedColor) {
      toast.warning('Please select a color.')
      return
    }
    if (product.sizes?.length && !selectedSize) {
      toast.warning('Please select a size.')
      return
    }
    if (quantity <= 0) {
      toast.warning('Please select a valid quantity.')
      return
    }

    addToCart({
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      },
      color: selectedColor ?? '',
      size: selectedSize ?? { name: '', description: '' },
      quantity,
    })
    toast.success('Product added to cart successfully!')
  }

  const gallery = product.images?.length ? product.images : []
  const specRows = specRowsFrom(product.specs ?? {}, SPEC_UNITS)

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-2">
            <ProductImage
              src={selectedImage ?? product.image}
              alt={product.title}
              className="h-112 w-full object-contain"
            />
          </div>
          {gallery.length > 1 && (
            <ul className="mt-3 flex flex-wrap gap-3">
              {gallery.map((image, i) => (
                <li key={`${image}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View image ${i + 1}`}
                    aria-current={selectedImage === image}
                    className={cn(
                      'focus-ring overflow-hidden rounded-md border-2 duration-fast ease-standard transition-colors',
                      selectedImage === image ? 'border-accent-default' : 'border-transparent',
                    )}
                  >
                    <ProductImage
                      src={image}
                      alt={`${product.title} thumbnail ${i + 1}`}
                      className="size-24 object-contain"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h1 className="mb-4 font-display text-3xl leading-tight font-semibold text-fg-primary md:text-4xl">
            {product.title}
          </h1>

          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-fg-tertiary">
            <span>{product.brand}</span>
            <span>
              · MPN{' '}
              <span className="numeric" data-numeric>
                {product.mpn}
              </span>
            </span>
            {product.rating != null && (
              <span className="flex items-center gap-1">
                ·
                <Star className="size-4 fill-warning-fg text-warning-fg" aria-hidden="true" />
                {product.rating}
              </span>
            )}
            {product.reviewCount != null && <span>· {product.reviewCount} Reviews</span>}
            {product.orderCount != null && <span>· {product.orderCount} Orders</span>}
          </div>

          <PriceDisplay value={product.price} size="xl" className="mb-8" />

          {product.colors?.length ? (
            <fieldset className="mb-6">
              <legend className="mb-2 font-medium">
                Color: <span className="text-fg-tertiary">{selectedColor}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    aria-pressed={selectedColor === color}
                    className={cn(
                      'focus-ring rounded-md border px-3 py-1.5 text-sm duration-fast ease-standard transition-colors',
                      selectedColor === color
                        ? 'border-accent-default text-accent-default'
                        : 'border-border-default text-fg-secondary hover:border-border-strong',
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {product.sizes?.length ? (
            <fieldset className="mb-6">
              <legend className="mb-2 font-medium">
                Size: <span className="text-fg-tertiary">{selectedSize?.name}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize?.name === size.name}
                    className={cn(
                      'focus-ring flex max-w-56 flex-col rounded-md border px-4 py-3 text-left duration-fast ease-standard transition-colors',
                      selectedSize?.name === size.name
                        ? 'border-accent-default'
                        : 'border-border-default hover:border-border-strong',
                    )}
                  >
                    <b>{size.name}</b>
                    <span className="text-fg-tertiary text-sm">{size.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          <div className="mb-6">
            <h2 className="mb-2 font-medium">Quantity</h2>
            <div className="flex w-36 items-center rounded-full border">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-l-full"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </Button>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                aria-label="Quantity"
                className="h-8 border-0 bg-transparent text-center shadow-none"
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-r-full"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mb-7 flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                handleAddToCart()
                navigate('/checkout')
              }}
              className="uppercase"
            >
              Buy now
            </Button>
            <Button variant="outline" onClick={handleAddToCart} className="uppercase">
              Add to cart
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite((value) => !value)}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Heart className={cn('size-5', isFavorite && 'fill-accent-default text-accent-default')} />
            </Button>
            <Button variant="ghost" size="icon" onClick={share} aria-label="Share product">
              <Share2 className="size-5" />
            </Button>
          </div>

          {product.description && (
            <p className="text-fg-tertiary">{product.description}</p>
          )}
        </div>
      </section>

      <Card>
        <CardContent>
          <Tabs defaultValue="specifications">
            <TabsList className="w-full">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="specifications" className="pt-6">
              <SpecTable
                rows={specRows}
                columns={[{ id: product.id, title: product.title, values: product.specs ?? {} }]}
                caption={`${product.title} specifications`}
              />
            </TabsContent>

            <TabsContent value="comments" className="pt-6">
              <p className="text-fg-tertiary">No comments yet.</p>
            </TabsContent>

            <TabsContent value="files" className="pt-6">
              {product.files?.length ? (
                <ul className="space-y-2">
                  {product.files.map((file, i) => (
                    <li key={`${file.name}-${i}`}>
                      <a
                        href={file.url}
                        download
                        className="focus-ring rounded-xs text-accent-default hover:underline"
                      >
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-fg-tertiary">No files available.</p>
              )}
            </TabsContent>

            <TabsContent value="faq" className="pt-6">
              {product.faqs?.length ? (
                <Accordion type="single" collapsible className="w-full">
                  {product.faqs.map((faq, i) => (
                    <AccordionItem key={`${faq.question}-${i}`} value={`faq-${i}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-fg-tertiary">No FAQs available.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
