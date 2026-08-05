import { useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ProductImage } from '@/components/ProductImage'
import { SIZES } from '@/lib/media'
import { EmptyState } from '@/components/EmptyState'
import { PriceDisplay } from '@/components/PriceDisplay'
import { formatLKR } from '@/lib/format'
import { shippingFeeOf, subtotalOf, taxOf, totalOf, useCartStore } from '@/store/cart'

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const storeCheckoutCart = useCartStore((state) => state.storeCheckoutCart)

  const checkout = () => {
    storeCheckoutCart(items)
    onOpenChange(false)
    navigate('/checkout')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              size="sm"
              title="Your cart is empty."
              description="Products you add will appear here."
            />
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.product.id}
                  className="relative flex gap-4 rounded-lg border border-border-subtle bg-surface-2 p-3"
                >
                  <ProductImage
                    assetId={item.product.id}
                    alt={item.product.title}
                    category={item.product.category}
                    mpn={item.product.mpn}
                    sizes={SIZES.cartLine}
                    className="size-20 shrink-0 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 pr-8 text-sm font-medium text-fg-primary">{item.product.title}</p>
                    <PriceDisplay value={item.product.price} size="sm" className="mt-1" />
                    <div className="mt-2 flex w-fit items-center rounded-full border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-l-full"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label={`Decrease quantity of ${item.product.title}`}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-r-full"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.product.title}`}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 size-8 text-fg-tertiary hover:text-danger-fg"
                    onClick={() => removeFromCart(item.product.id)}
                    aria-label={`Remove ${item.product.title} from cart`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <SheetFooter className="border-t">
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-4">
            <h3 className="mb-3 text-base font-medium text-fg-primary">Order Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt>Shipping Fee</dt>
                <dd className="numeric font-semibold text-fg-primary" data-numeric>{formatLKR(shippingFeeOf(items))}</dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <dt>Sub total</dt>
                <dd className="numeric font-semibold text-fg-primary" data-numeric>{formatLKR(subtotalOf(items))}</dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <dt>Tax</dt>
                <dd className="numeric font-semibold text-fg-primary" data-numeric>{formatLKR(taxOf(items))}</dd>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-base">
                <dt className="font-bold">Total</dt>
                <dd className="numeric font-bold text-fg-primary" data-numeric>{formatLKR(totalOf(items))}</dd>
              </div>
            </dl>
          </div>
          <Button className="w-full" onClick={checkout} disabled={items.length === 0}>
            BUY ({items.length})
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
