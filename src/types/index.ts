export interface Banner {
  id: number
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  /** Empty string means "no category filter" (link to the full grid). */
  category: string
  image: string
  backgroundColor: string
}

export interface Category {
  id: number
  name: string
  description: string
  icon: string
  slug: string
  startingPrice: number
}

export interface FeaturedProduct {
  id: number
  /** Id of the catalogue product this promotes; drives the "Learn More" link. */
  productId: string
  name: string
  description: string
  price: number
  oldPrice?: number
  image: string | null
  category: string
  badge?: {
    text: string
    color: string
  }
}

export interface Size {
  name: string
  description: string
}

export interface Faq {
  question: string
  answer: string
}

/** Category-relevant spec values; required keys per category live in `lib/catalogue-schema.ts`. */
export type ProductSpecs = Record<string, string | number | string[] | undefined>

export interface Product {
  id: string
  title: string
  brand: string
  mpn: string
  price: number
  category: string
  /** null until imagery is sourced; `ProductImage` renders a placeholder. */
  image: string | null
  specs: ProductSpecs
  images?: string[]
  colors?: string[]
  sizes?: Size[]
  rating?: number
  reviewCount?: number
  orderCount?: number
  description?: string
  faqs?: Faq[]
  files?: { name: string; url: string }[]
}

export interface FilterOptions {
  priceRange: {
    min: number
    max: number
    currency: string
  }
}

export interface CartItem {
  product: Pick<Product, 'id' | 'title' | 'price' | 'image'>
  color: string
  size: Size
  quantity: number
}
