import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CheckoutSteps } from '@/components/CheckoutSteps'
import { ProductImage } from '@/components/ProductImage'
import { SIZES } from '@/lib/media'
import { EmptyState } from '@/components/EmptyState'
import { PriceDisplay } from '@/components/PriceDisplay'
import { formatLKR } from '@/lib/format'
import { orderTotals, useCartStore } from '@/store/cart'

export default function Checkout() {
  const navigate = useNavigate()
  const orderItems = useCartStore((state) => state.checkoutItems)
  const appliedCoupon = useCartStore((state) => state.coupon)
  const applyCouponCode = useCartStore((state) => state.applyCoupon)

  const [couponInput, setCouponInput] = useState('')

  const { subtotal, shippingFee, tax, discount, total } = useMemo(
    () => orderTotals(orderItems, appliedCoupon),
    [orderItems, appliedCoupon],
  )

  const applyCoupon = () => {
    if (applyCouponCode(couponInput)) {
      toast.success('Coupon Code applied successfully')
    } else {
      toast.error('Invalid Coupon Code')
    }
  }

  const proceed = () => {
    navigate('/billing')
  }

  return (
    <div>
      <CheckoutSteps current={1} />

      {orderItems.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          headingLevel={1}
          title="Nothing to check out"
          description="Add some products to your cart first."
          action={<Button onClick={() => navigate('/product-grid')}>Browse products</Button>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <h1 className="sr-only">Review your order</h1>
          <ul className="flex flex-col gap-6">
            {orderItems.map((item) => (
              <li key={item.product.id}>
                <Card>
                  <CardContent className="flex flex-col gap-gutter sm:flex-row">
                    <ProductImage
                      assetId={item.product.id}
                      alt={item.product.title}
                      category={item.product.category}
                      mpn={item.product.mpn}
                      sizes={SIZES.checkoutLine}
                      className="h-36 w-full shrink-0 rounded-md sm:w-38"
                    />
                    <div className="flex flex-col justify-center gap-1">
                      <h2 className="text-lg font-medium">{item.product.title}</h2>
                      <PriceDisplay value={item.product.price} />
                      {item.color && (
                        <p className="text-fg-tertiary text-sm">Color: {item.color}</p>
                      )}
                      {item.size?.name && (
                        <p className="text-fg-tertiary text-sm">Size: {item.size.name}</p>
                      )}
                      <p className="text-fg-tertiary text-sm">Quantity: {item.quantity}</p>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-2xl">Your Order</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="text-fg-tertiary grid grid-cols-3 text-sm font-medium">
                  <dt className="col-span-2">Product</dt>
                  <dd className="text-right">Price</dd>
                </div>
                <Separator />

                {orderItems.map((item) => (
                  <div key={item.product.id}>
                    <div className="grid grid-cols-3 gap-3">
                      <dt className="col-span-2 line-clamp-2 font-medium">{item.product.title}</dt>
                      <dd className="text-right font-medium">
                        {formatLKR(item.product.price * item.quantity)}
                      </dd>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}

                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="numeric font-medium" data-numeric>{formatLKR(subtotal)}</dd>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <dt>Shipping Fee</dt>
                  <dd className="numeric font-medium" data-numeric>{formatLKR(shippingFee)}</dd>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <dt>Tax</dt>
                  <dd className="numeric font-medium" data-numeric>{formatLKR(tax)}</dd>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <dt>Coupon</dt>
                  <dd className="numeric font-medium" data-numeric>{appliedCoupon || '—'}</dd>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <dt>Discount</dt>
                  <dd className="numeric font-medium" data-numeric>-{formatLKR(discount)}</dd>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <dt className="font-bold">Total</dt>
                  <dd className="numeric font-bold" data-numeric>{formatLKR(total)}</dd>
                </div>
              </dl>

              <form
                className="mt-6 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  applyCoupon()
                }}
              >
                <Input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="Enter Coupon"
                  aria-label="Coupon code"
                />
                <Button type="submit" variant="secondary">
                  Apply
                </Button>
              </form>

              <Button className="mt-4 w-full" onClick={proceed}>
                Proceed To Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
