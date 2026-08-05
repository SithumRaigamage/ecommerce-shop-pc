import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CartSheet } from '@/components/CartSheet'
import { ErrorBoundary } from '@/components/ErrorBoundary'
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


export function MainLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader onCartClick={() => setCartOpen(true)} />

      {/*
        No global rail. It used to render category navigation on every page at
        176px wide — too narrow to be a real filter panel and irrelevant on
        checkout. On a facet-driven catalogue the rail is primary UI, so the
        page that needs one owns it (see ProductGrid); everything else gets the
        full measure. Category browsing lives in the header and its mobile sheet.
      */}
      <main className="min-w-0 flex-1 px-gutter py-gutter">
        {/*
          Route change is a crossfade and nothing else. A slide would claim the
          pages sit beside each other in space, which is false for a header-and-
          footer shell whose chrome never moves. Keyed on pathname so the fade
          replays per navigation; 150ms, below the threshold where a transition
          starts to feel like waiting.
        */}
        <div key={pathname} className="animate-fade-in">
          <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>

      <SiteFooter />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  )
}
