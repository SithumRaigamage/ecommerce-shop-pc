import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { MainLayout } from '@/components/layout/MainLayout'
import Home from '@/pages/Home'

/**
 * Home is eager (it is the entry point for most sessions); everything else is
 * split out so the initial download isn't carrying the checkout funnel, the
 * forms stack and the product detail page.
 */
const ProductGrid = lazy(() => import('@/pages/ProductGrid'))
const ProductOverview = lazy(() => import('@/pages/ProductOverview'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const Billing = lazy(() => import('@/pages/Billing'))
const OrderMessage = lazy(() => import('@/pages/OrderMessage'))
const Profile = lazy(() => import('@/pages/Profile'))
const SignIn = lazy(() => import('@/pages/SignIn'))
const Support = lazy(() => import('@/pages/Support'))
const ComingSoon = lazy(() => import('@/pages/ComingSoon'))
const CategoryRedirect = lazy(() => import('@/pages/CategoryRedirect'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="build" element={<ComingSoon />} />
          <Route path="deals" element={<ComingSoon />} />
          <Route path="support" element={<Support />} />
          <Route path="settings" element={<Profile />} />
          <Route path="login" element={<SignIn />} />
          <Route path="logout" element={<SignIn />} />
          <Route path="product-grid" element={<ProductGrid />} />
          <Route path="product-overview/:id" element={<ProductOverview />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="billing" element={<Billing />} />
          <Route path="thankyou" element={<OrderMessage />} />
          <Route path="warranty" element={<ComingSoon />} />
          <Route path="installation" element={<ComingSoon />} />
          <Route path="contact" element={<ComingSoon />} />
          <Route path="faq" element={<ComingSoon />} />
          <Route path="shipping" element={<ComingSoon />} />
          <Route path="returns" element={<ComingSoon />} />
          <Route path="track-order" element={<ComingSoon />} />
          <Route path="category/:slug" element={<CategoryRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster richColors />
    </>
  )
}
