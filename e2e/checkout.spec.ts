import { expect, test } from '@playwright/test'
import { addFirstProductToCart, failOnPageErrors, openCart } from './helpers'

test.describe('purchase funnel', () => {
  test('completes an order from product page to confirmation', async ({ page }) => {
    const errors = failOnPageErrors(page)

    const title = await addFirstProductToCart(page, 'processor')
    await expect(page.getByRole('button', { name: 'Open cart' })).toContainText('1')

    const cart = await openCart(page)
    await expect(cart.getByText(title)).toBeVisible()
    await cart.getByRole('button', { name: /^BUY \(1\)/ }).click()

    await page.waitForURL('**/checkout')
    await page.getByPlaceholder('Enter Coupon').fill('DISCOUNT20')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByText('Coupon Code applied successfully')).toBeVisible()

    await page.getByRole('button', { name: 'Proceed To Checkout' }).click()
    await page.waitForURL('**/billing')

    await page.getByLabel('Full Name').fill('Jon Doe')
    await page.getByLabel('Email').fill('jon@example.com')
    await page.getByLabel('Country').fill('Sri Lanka')
    await page.getByLabel('Street Address').fill('11 Galle Road')
    await page.getByLabel('Post Code').fill('10100')
    await page.getByLabel('Phone').fill('0712345678')
    await page.getByRole('radio', { name: 'Cash on Delivery' }).click()
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: /^Pay/ }).click()

    await page.waitForURL('**/thankyou')
    await expect(page.getByRole('heading', { name: 'Your Order is Successful' })).toBeVisible()

    // The cart is emptied once the order is placed.
    await expect(page.getByRole('button', { name: 'Open cart' })).not.toContainText('1')
    expect(errors).toEqual([])
  })

  test('rejects an invalid coupon', async ({ page }) => {
    await addFirstProductToCart(page, 'processor')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: /^BUY/ }).click()
    await page.waitForURL('**/checkout')

    await page.getByPlaceholder('Enter Coupon').fill('NOPE')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByText('Invalid Coupon Code')).toBeVisible()
  })

  test('blocks submission until billing details and payment are valid', async ({ page }) => {
    await addFirstProductToCart(page, 'processor')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: /^BUY/ }).click()
    await page.waitForURL('**/checkout')
    await page.getByRole('button', { name: 'Proceed To Checkout' }).click()
    await page.waitForURL('**/billing')

    await page.getByRole('button', { name: /^Pay/ }).click()

    await expect(page.getByText('Name is required')).toBeVisible()
    await expect(page.getByText('Please select a payment method')).toBeVisible()
    await expect(page.getByText('You must agree to the terms and conditions')).toBeVisible()
    await expect(page).toHaveURL(/\/billing/)
  })

  test('requires a card number only when paying by card', async ({ page }) => {
    await addFirstProductToCart(page, 'processor')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: /^BUY/ }).click()
    await page.waitForURL('**/checkout')
    await page.getByRole('button', { name: 'Proceed To Checkout' }).click()
    await page.waitForURL('**/billing')

    await expect(page.getByLabel('Card Number')).toBeHidden()

    await page.getByRole('radio', { name: 'Debit or Credit Card' }).click()
    await expect(page.getByLabel('Card Number')).toBeVisible()

    await page.getByRole('button', { name: /^Pay/ }).click()
    await expect(page.getByText('Card number is required')).toBeVisible()
  })

  test('keeps the order and coupon across a reload of checkout and billing', async ({ page }) => {
    await addFirstProductToCart(page, 'processor')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: /^BUY/ }).click()
    await page.waitForURL('**/checkout')

    await page.getByPlaceholder('Enter Coupon').fill('DISCOUNT20')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByText('Coupon Code applied successfully')).toBeVisible()
    const totalBefore = await page.getByText(/^LKR/).last().textContent()

    await page.reload()
    await expect(page.getByText('DISCOUNT20')).toBeVisible()
    expect(await page.getByText(/^LKR/).last().textContent()).toBe(totalBefore)

    await page.getByRole('button', { name: 'Proceed To Checkout' }).click()
    await page.waitForURL('**/billing')
    const billingTotal = await page.getByRole('button', { name: /^Pay/ }).textContent()

    // Location state does not survive a reload; the persisted store must.
    await page.reload()
    await expect(page).toHaveURL(/\/billing/)
    await expect(page.getByRole('button', { name: /^Pay/ })).toHaveText(billingTotal!)
  })

  test('billing bounces back to checkout when nothing is pending', async ({ page }) => {
    await page.goto('/billing')
    await expect(page).toHaveURL(/\/checkout/)
  })

  test('checkout with an empty cart offers a way back to the catalogue', async ({ page }) => {
    await page.goto('/checkout')
    await expect(page.getByRole('heading', { name: 'Nothing to check out' })).toBeVisible()
    await page.getByRole('button', { name: 'Browse products' }).click()
    await expect(page).toHaveURL(/\/product-grid/)
  })
})

test.describe('cart', () => {
  test('updates quantity and removes items', async ({ page }) => {
    const title = await addFirstProductToCart(page, 'processor')
    const cart = await openCart(page)

    await cart.getByRole('button', { name: `Increase quantity of ${title}` }).click()
    await expect(cart.getByRole('button', { name: /^BUY \(1\)/ })).toBeVisible()

    await cart.getByRole('button', { name: `Remove ${title} from cart` }).click()
    await expect(cart.getByText('Your cart is empty.')).toBeVisible()
    await expect(cart.getByRole('button', { name: /^BUY \(0\)/ })).toBeDisabled()
  })

  test('keeps distinct products on separate cart lines', async ({
    page,
  }) => {
    // Two products from different categories must occupy separate cart lines.
    const first = await addFirstProductToCart(page, 'processor')
    const second = await addFirstProductToCart(page, 'graphics')
    expect(second).not.toBe(first)

    const cart = await openCart(page)
    await expect(cart.getByRole('listitem')).toHaveCount(2)
    await expect(cart.getByRole('button', { name: /^BUY \(2\)/ })).toBeVisible()
  })

  test('survives a page reload', async ({ page }) => {
    const title = await addFirstProductToCart(page, 'processor')

    await page.reload()

    await expect(page.getByRole('button', { name: 'Open cart' })).toContainText('1')
    const cart = await openCart(page)
    await expect(cart.getByText(title)).toBeVisible()
  })

  test('an emptied cart stays empty across a reload', async ({ page }) => {
    const title = await addFirstProductToCart(page, 'processor')
    const cart = await openCart(page)
    await cart.getByRole('button', { name: `Remove ${title} from cart` }).click()

    await page.reload()

    await expect(page.getByRole('button', { name: 'Open cart' })).not.toContainText('1')
  })
})
