import type { ComponentType } from 'react'

/**
 * Every route in the application, declared once.
 *
 * This used to be a hand-maintained list of path strings mirroring the JSX in
 * App.tsx, and the two drifted exactly as you would expect: the footer linked to
 * six paths that were never declared and so rendered the 404 page, and the auth
 * routes were `/login` here and `/sign-in` everywhere they were discussed.
 *
 * The router is now generated from this array, and so are the header nav, the
 * footer and /sitemap. Adding a route means adding one entry, and forgetting to
 * wire it up somewhere is no longer possible. `routes.test.ts` asserts that
 * every entry resolves to a real component and that every `<Link to>` in the
 * codebase points at a path declared here.
 */

/** Where a route appears in navigation. A route in no group is reachable but unlisted. */
export type NavGroup = 'primary' | 'shop' | 'support' | 'service' | 'company'

export interface RouteDefinition {
  path: string
  /**
   * Dynamic import of the route's component. Omitted for redirects and for the
   * index route, which is eager because it is most sessions' entry point.
   */
  load?: () => Promise<{ default: ComponentType }>
  /** Declared instead of `load` when the path exists only to redirect. */
  redirectTo?: string
  /** Nav label. Required to appear in any nav group or in the sitemap. */
  label?: string
  /** Nav groups this route belongs to. */
  nav?: NavGroup[]
  /**
   * True when the route renders shared placeholder content rather than its own.
   * Kept in the data so the number is visible rather than found by clicking.
   */
  placeholder?: boolean
}

export const ROUTES: RouteDefinition[] = [
  { path: '/', label: 'Home' },

  /* -------------------------------------------------------------- catalogue */
  {
    path: '/product-grid',
    label: 'Shop All',
    nav: ['shop'],
    load: () => import('@/pages/ProductGrid'),
  },
  { path: '/product-overview/:id', load: () => import('@/pages/ProductOverview') },
  {
    path: '/build',
    label: 'Build Your PC',
    nav: ['primary', 'shop', 'support'],
    load: () => import('@/pages/ComingSoon'),
    placeholder: true,
  },
  {
    path: '/deals',
    label: 'Deals',
    nav: ['primary', 'shop'],
    load: () => import('@/pages/ComingSoon'),
    placeholder: true,
  },

  /* --------------------------------------------------------------- commerce */
  { path: '/checkout', load: () => import('@/pages/Checkout') },
  { path: '/billing', load: () => import('@/pages/Billing') },
  { path: '/thankyou', load: () => import('@/pages/OrderMessage') },
  {
    path: '/track-order',
    label: 'Track Order',
    nav: ['service'],
    load: () => import('@/pages/ComingSoon'),
    placeholder: true,
  },

  /* ------------------------------------------------------------------- auth */
  // /sign-in and /sign-out are canonical; /login and /logout below redirect
  // here so existing links and bookmarks keep working.
  { path: '/sign-in', label: 'Sign In', load: () => import('@/pages/SignIn') },
  { path: '/sign-out', label: 'Sign out', load: () => import('@/pages/SignIn') },
  { path: '/login', redirectTo: '/sign-in' },
  { path: '/logout', redirectTo: '/sign-out' },
  { path: '/settings', label: 'Settings', load: () => import('@/pages/Profile') },

  /* ---------------------------------------------------------------- support */
  {
    path: '/support',
    label: 'Support',
    nav: ['primary', 'support'],
    load: () => import('@/pages/Support'),
  },
  {
    path: '/warranty',
    label: 'Warranty Info',
    nav: ['support'],
    load: () => import('@/pages/ComingSoon'),
    placeholder: true,
  },
  {
    path: '/installation',
    label: 'Installation Services',
    nav: ['support'],
    load: () => import('@/pages/ComingSoon'),
    placeholder: true,
  },
  {
    path: '/contact',
    label: 'Contact Us',
    nav: ['service'],
    load: () => import('@/pages/ComingSoon'),
    placeholder: true,
  },
  {
    path: '/faq',
    label: 'FAQs',
    nav: ['service'],
    load: () => import('@/pages/ComingSoon'),
    placeholder: true,
  },
  {
    path: '/shipping',
    label: 'Shipping Info',
    nav: ['service'],
    load: () => import('@/pages/ComingSoon'),
    placeholder: true,
  },
  {
    path: '/returns',
    label: 'Returns',
    nav: ['service'],
    load: () => import('@/pages/ComingSoon'),
    placeholder: true,
  },

  /* ---------------------------------------------------------------- company */
  // Linked from the footer and declared nowhere, so every one of these rendered
  // the 404 page. Declaring them is what makes the gap countable.
  {
    path: '/about',
    label: 'About Us',
    nav: ['company'],
    load: () => import('@/pages/ComingSoon'),
    placeholder: true,
  },
  {
    path: '/privacy',
    label: 'Privacy Policy',
    nav: ['company'],
    load: () => import('@/pages/ComingSoon'),
    placeholder: true,
  },
  {
    path: '/terms',
    label: 'Terms of Service',
    nav: ['company'],
    load: () => import('@/pages/ComingSoon'),
    placeholder: true,
  },
  // Generated from this very array, which is rather the point of it existing.
  { path: '/sitemap', label: 'Sitemap', nav: ['company'], load: () => import('@/pages/Sitemap') },

  /* ------------------------------------------------------------------ other */
  /** Legacy alias kept alive for old links; redirects into the product grid. */
  { path: '/category/:slug', load: () => import('@/pages/CategoryRedirect') },
  /** Component reference; deliberately not linked from the app. */
  { path: '/styleguide', load: () => import('@/pages/StyleGuide') },
]

/** Every declared path. */
export const ROUTE_PATHS = ROUTES.map((route) => route.path)

export interface NavRoute {
  path: string
  label: string
}

/** Routes in a nav group, in declaration order. */
export function navRoutes(group: NavGroup): NavRoute[] {
  return ROUTES.filter((route) => route.nav?.includes(group) && route.label).map((route) => ({
    path: route.path,
    label: route.label as string,
  }))
}

/** Routes still rendering shared placeholder content. */
export function placeholderRoutes(): RouteDefinition[] {
  return ROUTES.filter((route) => route.placeholder)
}

/** True when `path` (no query string) matches a declared route. */
export function isKnownRoute(path: string): boolean {
  const segments = path.split('/').filter(Boolean)

  return ROUTE_PATHS.some((route) => {
    const routeSegments = route.split('/').filter(Boolean)
    if (routeSegments.length !== segments.length) return false
    return routeSegments.every((segment, i) => segment.startsWith(':') || segment === segments[i])
  })
}
