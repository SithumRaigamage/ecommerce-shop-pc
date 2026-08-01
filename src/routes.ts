/**
 * The route table lives here as plain data so that content fixtures
 * (`banner.json`) can be validated against the real set of routes in a unit
 * test, rather than drifting into 404s the way `/category/workstations` did.
 */
export const ROUTE_PATHS = [
  '/',
  '/build',
  '/deals',
  '/support',
  '/settings',
  '/login',
  '/logout',
  '/product-grid',
  '/product-overview/:id',
  '/checkout',
  '/billing',
  '/thankyou',
  '/warranty',
  '/installation',
  '/contact',
  '/faq',
  '/shipping',
  '/returns',
  '/track-order',
  /** Component reference; not linked from the app. */
  '/styleguide',
  /** Legacy alias kept alive for old links; redirects to /product-grid. */
  '/category/:slug',
] as const

export type RoutePath = (typeof ROUTE_PATHS)[number]

/** True when `path` (no query string) matches a declared route. */
export function isKnownRoute(path: string): boolean {
  const segments = path.split('/').filter(Boolean)

  return ROUTE_PATHS.some((route) => {
    const routeSegments = route.split('/').filter(Boolean)
    if (routeSegments.length !== segments.length) return false
    return routeSegments.every(
      (segment, i) => segment.startsWith(':') || segment === segments[i],
    )
  })
}
