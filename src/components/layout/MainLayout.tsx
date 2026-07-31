import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CartSheet } from '@/components/CartSheet'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SideNav } from '@/components/layout/SideNav'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Skeleton } from '@/components/ui/skeleton'

/** Shown while a lazily-loaded route chunk is in flight. */
function RouteFallback() {
  return (
    <div className="space-y-6 py-6" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

/** Routes that took over the full width in the Angular layout. */
const FULL_WIDTH_ROUTES = ['/checkout', '/billing', '/thankyou', '/login', '/logout', '/settings']

export function MainLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const { pathname } = useLocation()

  const showSidebar = !FULL_WIDTH_ROUTES.some((route) => pathname.startsWith(route))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader onCartClick={() => setCartOpen(true)} />

      <div className="flex flex-1 items-start gap-6 px-5 py-6 lg:px-8">
        {showSidebar && (
          <SideNav className="sticky top-22 hidden max-h-[calc(100vh-6.5rem)] w-44 shrink-0 overflow-y-auto lg:block" />
        )}
        <main className="min-w-0 flex-1">
          <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <SiteFooter />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  )
}
