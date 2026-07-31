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
  image: string
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

export interface Product {
  id: string
  title: string
  price: number
  image: string
  images?: string[]
  category: string
  colors?: string[]
  sizes?: Size[]
  rating?: number
  reviewCount?: number
  orderCount?: number
  description?: string
  faqs?: Faq[]
  specifications?: { name: string; value: string }[]
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
