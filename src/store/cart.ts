import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

export const SHIPPING_FEE = 300
export const TAX_RATE = 0.08

export const COUPON_CODES: Record<string, number> = {
  DISCOUNT10: 0.1,
  DISCOUNT20: 0.2,
  DISCOUNT30: 0.3,
}

export function subtotalOf(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
}

export function shippingFeeOf(items: CartItem[]): number {
  return items.length > 0 ? SHIPPING_FEE : 0
}

export function taxOf(items: CartItem[]): number {
  return subtotalOf(items) * TAX_RATE
}

export function discountOf(items: CartItem[], coupon: string): number {
  return subtotalOf(items) * (COUPON_CODES[coupon] ?? 0)
}

export function totalOf(items: CartItem[], coupon = ''): number {
  return subtotalOf(items) + shippingFeeOf(items) + taxOf(items) - discountOf(items, coupon)
}

export interface OrderTotals {
  subtotal: number
  shippingFee: number
  tax: number
  discount: number
  total: number
}

/**
 * Single source of the order maths, so the cart drawer, checkout summary and
 * billing page cannot drift apart.
 */
export function orderTotals(items: CartItem[], coupon = ''): OrderTotals {
  return {
    subtotal: subtotalOf(items),
    shippingFee: shippingFeeOf(items),
    tax: taxOf(items),
    discount: discountOf(items, coupon),
    total: totalOf(items, coupon),
  }
}

interface CartState {
  items: CartItem[]
  /** Snapshot taken when the user hits checkout, mirroring the old `checkoutCart$`. */
  checkoutItems: CartItem[]
  /** Validated coupon code applied to the checkout snapshot ('' when none). */
  coupon: string
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  storeCheckoutCart: (items: CartItem[]) => void
  /** Returns whether the code was recognised. */
  applyCoupon: (code: string) => boolean
  /** Order placed: drop the live cart, the checkout snapshot and the coupon. */
  completeOrder: () => void
}

export const CART_STORAGE_KEY = 'pc-shop-cart'

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      checkoutItems: [],
      coupon: '',

      addToCart: (item) =>
        set((state) => {
          const index = state.items.findIndex((i) => i.product.id === item.product.id)
          if (index === -1) {
            return { items: [...state.items, { ...item }] }
          }
          const items = [...state.items]
          items[index] = { ...items[index], quantity: items[index].quantity + item.quantity }
          return { items }
        }),

      removeFromCart: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity < 1) return state
          return {
            items: state.items.map((i) =>
              i.product.id === productId ? { ...i, quantity } : i,
            ),
          }
        }),

      clearCart: () => set({ items: [] }),

      storeCheckoutCart: (items) => set({ checkoutItems: items, coupon: '' }),

      applyCoupon: (code) => {
        const normalized = code.trim().toUpperCase()
        const valid = normalized in COUPON_CODES
        set({ coupon: valid ? normalized : '' })
        return valid
      },

      completeOrder: () => set({ items: [], checkoutItems: [], coupon: '' }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only data is persisted; the actions come from the store definition.
      partialize: (state) => ({
        items: state.items,
        checkoutItems: state.checkoutItems,
        coupon: state.coupon,
      }),
    },
  ),
)
