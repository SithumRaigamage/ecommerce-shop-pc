import { lazy, type ComponentType } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { MainLayout } from '@/components/layout/MainLayout'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import { ROUTES } from '@/routes'

/**
 * The router is generated from `routes.ts`. There is deliberately no route list
 * in this file to fall out of sync with that one — which is exactly what used
 * to happen.
 *
 * Home and NotFound are eager: Home is most sessions' entry point, and NotFound
 * is the one route that must not depend on a chunk load succeeding.
 */

/**
 * Lazy components are created once, at module scope. Calling `lazy()` during
 * render would mint a new component type on every pass and remount the page.
 */
const ELEMENTS = new Map<string, ComponentType>(
  ROUTES.flatMap((route) =>
    route.load ? [[route.path, lazy(route.load)] as [string, ComponentType]] : [],
  ),
)

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          {ROUTES.map((route) => {
            if (route.path === '/') return <Route key="/" index element={<Home />} />

            if (route.redirectTo) {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<Navigate replace to={route.redirectTo} />}
                />
              )
            }

            const Element = ELEMENTS.get(route.path)
            if (!Element) return null
            return <Route key={route.path} path={route.path} element={<Element />} />
          })}

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster richColors />
    </>
  )
}
