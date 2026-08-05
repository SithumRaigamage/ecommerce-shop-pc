import { Navigate, useParams } from 'react-router-dom'
import { normalizeCategory } from '@/lib/categories'

/**
 * The original Angular app linked to `/category/<slug>` from several banners but
 * never registered the route, so those links dead-ended. Rather than resurrect a
 * duplicate listing page, translate the slug into the query the product grid
 * already understands. Unknown slugs fall through to the unfiltered grid.
 */
export default function CategoryRedirect() {
  const { slug } = useParams<{ slug: string }>()
  const category = normalizeCategory(slug)

  return (
    <Navigate
      replace
      to={category ? `/product-grid?category=${encodeURIComponent(category)}` : '/product-grid'}
    />
  )
}
