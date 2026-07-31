import { beforeEach, describe, expect, it } from 'vitest'
import {
  CART_STORAGE_KEY,
  SHIPPING_FEE,
  TAX_RATE,
  discountOf,
  orderTotals,
  shippingFeeOf,
  subtotalOf,
  taxOf,
  totalOf,
  useCartStore,
} from './cart'
import type { CartItem } from '@/types'

function makeItem(id: string, price: number, quantity = 1): CartItem {
  return {
    product: { id, title: `Product ${id}`, price, image: `assets/products/${id}.png` },
    color: 'Black',
    size: { name: 'Standard', description: '' },
    quantity,
  }
}

describe('cart store', () => {
  beforeEach(() => {
    localStorage.clear()
    useCartStore.setState({ items: [], checkoutItems: [], coupon: '' })
  })

  it('adds a new item', () => {
    useCartStore.getState().addToCart(makeItem('1', 1000))
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  it('merges quantities when the same product is added twice', () => {
    const { addToCart } = useCartStore.getState()
    addToCart(makeItem('1', 1000, 2))
    addToCart(makeItem('1', 1000, 3))

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(5)
  })

  it('removes an item by product id', () => {
    const { addToCart, removeFromCart } = useCartStore.getState()
    addToCart(makeItem('1', 1000))
    addToCart(makeItem('2', 2000))
    removeFromCart('1')

    expect(useCartStore.getState().items.map((i) => i.product.id)).toEqual(['2'])
  })

  it('ignores quantity updates below 1', () => {
    const { addToCart, updateQuantity } = useCartStore.getState()
    addToCart(makeItem('1', 1000, 1))
    updateQuantity('1', 0)

    expect(useCartStore.getState().items[0].quantity).toBe(1)
  })

  it('updates quantity for a single product', () => {
    const { addToCart, updateQuantity } = useCartStore.getState()
    addToCart(makeItem('1', 1000))
    addToCart(makeItem('2', 2000))
    updateQuantity('2', 4)

    const items = useCartStore.getState().items
    expect(items.find((i) => i.product.id === '2')?.quantity).toBe(4)
    expect(items.find((i) => i.product.id === '1')?.quantity).toBe(1)
  })

  it('clears the cart', () => {
    const { addToCart, clearCart } = useCartStore.getState()
    addToCart(makeItem('1', 1000))
    clearCart()

    expect(useCartStore.getState().items).toEqual([])
  })

  it('snapshots items for checkout independently of the live cart', () => {
    const { addToCart, storeCheckoutCart, clearCart } = useCartStore.getState()
    addToCart(makeItem('1', 1000))
    storeCheckoutCart(useCartStore.getState().items)
    clearCart()

    expect(useCartStore.getState().items).toEqual([])
    expect(useCartStore.getState().checkoutItems).toHaveLength(1)
  })

  it('drops everything once the order is placed', () => {
    const { addToCart, storeCheckoutCart, applyCoupon, completeOrder } = useCartStore.getState()
    addToCart(makeItem('1', 1000))
    storeCheckoutCart(useCartStore.getState().items)
    applyCoupon('DISCOUNT10')
    completeOrder()

    const state = useCartStore.getState()
    expect(state.items).toEqual([])
    expect(state.checkoutItems).toEqual([])
    expect(state.coupon).toBe('')
  })
})

describe('coupons', () => {
  beforeEach(() => {
    localStorage.clear()
    useCartStore.setState({ items: [], checkoutItems: [], coupon: '' })
  })

  it('accepts a known code and normalises its casing', () => {
    expect(useCartStore.getState().applyCoupon('discount20')).toBe(true)
    expect(useCartStore.getState().coupon).toBe('DISCOUNT20')
  })

  it('trims surrounding whitespace', () => {
    expect(useCartStore.getState().applyCoupon('  DISCOUNT10  ')).toBe(true)
    expect(useCartStore.getState().coupon).toBe('DISCOUNT10')
  })

  it('rejects an unknown code and clears any previous one', () => {
    useCartStore.getState().applyCoupon('DISCOUNT30')
    expect(useCartStore.getState().applyCoupon('NOPE')).toBe(false)
    expect(useCartStore.getState().coupon).toBe('')
  })

  it('discounts the subtotal only, not shipping or tax', () => {
    const items = [makeItem('1', 1000, 2)]
    expect(discountOf(items, 'DISCOUNT20')).toBe(400)
    expect(discountOf(items, '')).toBe(0)
    expect(discountOf(items, 'NOPE')).toBe(0)
  })

  it('is reset when a new checkout snapshot is taken', () => {
    useCartStore.getState().applyCoupon('DISCOUNT20')
    useCartStore.getState().storeCheckoutCart([makeItem('1', 1000)])
    expect(useCartStore.getState().coupon).toBe('')
  })
})

/**
 * Regression cover for the cart emptying on refresh: the store is persisted, so
 * a fresh page load must rehydrate the items, the checkout snapshot and coupon.
 */
describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    useCartStore.setState({ items: [], checkoutItems: [], coupon: '' })
  })

  it('writes the cart to localStorage', async () => {
    useCartStore.getState().addToCart(makeItem('1', 1000, 2))

    const raw = localStorage.getItem(CART_STORAGE_KEY)
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!).state.items[0].quantity).toBe(2)
  })

  it('persists the checkout snapshot and coupon', () => {
    useCartStore.getState().storeCheckoutCart([makeItem('1', 1000)])
    useCartStore.getState().applyCoupon('DISCOUNT10')

    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!).state
    expect(stored.checkoutItems).toHaveLength(1)
    expect(stored.coupon).toBe('DISCOUNT10')
  })

  it('does not persist the action functions', () => {
    useCartStore.getState().addToCart(makeItem('1', 1000))

    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!).state
    expect(Object.keys(stored).sort()).toEqual(['checkoutItems', 'coupon', 'items'])
  })

  it('rehydrates a cart written by a previous session', async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: { items: [makeItem('42', 5000, 3)], checkoutItems: [], coupon: 'DISCOUNT20' },
      }),
    )

    await useCartStore.persist.rehydrate()

    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].product.id).toBe('42')
    expect(state.items[0].quantity).toBe(3)
    expect(state.coupon).toBe('DISCOUNT20')
  })

  it('starts empty when there is nothing stored', async () => {
    await useCartStore.persist.rehydrate()
    expect(useCartStore.getState().items).toEqual([])
  })
})

describe('cart totals', () => {
  it('returns zero shipping for an empty cart', () => {
    expect(shippingFeeOf([])).toBe(0)
    expect(totalOf([])).toBe(0)
  })

  it('computes subtotal, tax, shipping and total', () => {
    const items = [makeItem('1', 1000, 2), makeItem('2', 500, 1)]

    expect(subtotalOf(items)).toBe(2500)
    expect(taxOf(items)).toBeCloseTo(2500 * TAX_RATE, 6)
    expect(shippingFeeOf(items)).toBe(SHIPPING_FEE)
    expect(totalOf(items)).toBeCloseTo(2500 + SHIPPING_FEE + 2500 * TAX_RATE, 6)
  })

  it('subtracts a coupon discount from the total', () => {
    const items = [makeItem('1', 1000, 2)]
    const withoutCoupon = totalOf(items)
    expect(totalOf(items, 'DISCOUNT20')).toBeCloseTo(withoutCoupon - 400, 6)
  })

  it('orderTotals agrees with the individual helpers', () => {
    const items = [makeItem('1', 1000, 2), makeItem('2', 500, 1)]
    const totals = orderTotals(items, 'DISCOUNT10')

    expect(totals.subtotal).toBe(subtotalOf(items))
    expect(totals.shippingFee).toBe(shippingFeeOf(items))
    expect(totals.tax).toBeCloseTo(taxOf(items), 6)
    expect(totals.discount).toBeCloseTo(discountOf(items, 'DISCOUNT10'), 6)
    expect(totals.total).toBeCloseTo(
      totals.subtotal + totals.shippingFee + totals.tax - totals.discount,
      6,
    )
  })

  it('returns zeroes for an empty cart even with a coupon', () => {
    expect(orderTotals([], 'DISCOUNT30')).toEqual({
      subtotal: 0,
      shippingFee: 0,
      tax: 0,
      discount: 0,
      total: 0,
    })
  })
})
