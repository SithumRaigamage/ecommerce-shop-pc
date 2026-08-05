import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { CartSheet } from './CartSheet'
import { ThemeProvider } from './ThemeProvider'
import { useCartStore } from '@/store/cart'
import type { CartItem } from '@/types'

const item: CartItem = {
  product: { id: '1', title: 'PlayStation 5', price: 180000, category: 'cases', mpn: 'CFI-2000' },
  color: 'White',
  size: { name: 'SLIM', description: 'Small size for comfort' },
  quantity: 1,
}

function renderCart() {
  // ThemeProvider because a cart line renders product imagery, and imagery
  // built from an opaque source has one asset per theme.
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <CartSheet open onOpenChange={() => {}} />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('CartSheet', () => {
  beforeEach(() => {
    localStorage.clear()
    useCartStore.setState({ items: [], checkoutItems: [], coupon: '' })
  })

  it('shows an empty state when there is nothing in the cart', () => {
    renderCart()
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
  })

  it('lists cart items with their price', () => {
    useCartStore.setState({ items: [item] })
    renderCart()

    const row = within(screen.getByRole('listitem'))
    expect(row.getByText('PlayStation 5')).toBeInTheDocument()
    expect(row.getByText(/180,000\.00/)).toBeInTheDocument()
  })

  it('increments quantity from the sheet', async () => {
    const user = userEvent.setup()
    useCartStore.setState({ items: [item] })
    renderCart()

    await user.click(screen.getByRole('button', { name: /increase quantity of playstation 5/i }))

    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('removes an item from the sheet', async () => {
    const user = userEvent.setup()
    useCartStore.setState({ items: [item] })
    renderCart()

    await user.click(screen.getByRole('button', { name: /remove playstation 5 from cart/i }))

    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('disables the buy button when the cart is empty', () => {
    renderCart()
    expect(screen.getByRole('button', { name: /buy \(0\)/i })).toBeDisabled()
  })
})
