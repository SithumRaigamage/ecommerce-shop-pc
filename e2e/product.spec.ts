import { expect, test } from '@playwright/test'
import { failOnPageErrors } from './helpers'

test.describe('product discovery', () => {
  test('filters the grid by maximum price', async ({ page }) => {
    await page.goto('/product-grid?category=gaming')

    const cards = page.getByRole('link', { name: 'View Details' })
    await expect(cards.first()).toBeVisible()
    const before = await cards.count()
    expect(before).toBeGreaterThan(0)

    const slider = page.getByRole('slider', { name: 'Maximum price' })
    await slider.focus()
    await slider.press('Home')

    await expect(cards).toHaveCount(0)
    await expect(page.getByText(/No products found/)).toBeVisible()

    await slider.press('End')
    await expect(cards).toHaveCount(before)
  })

  test('product detail shows gallery, tabs and FAQ', async ({ page }) => {
    const errors = failOnPageErrors(page)
    await page.goto('/product-overview/1')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Specifications' })).toBeVisible()

    await page.getByRole('tab', { name: 'FAQ' }).click()
    const firstFaq = page.locator('[data-slot="accordion-trigger"]').first()
    await expect(firstFaq).toBeVisible()
    await firstFaq.click()
    await expect(page.locator('[data-slot="accordion-content"]').first()).toBeVisible()

    expect(errors).toEqual([])
  })

  test('quantity stepper will not go below one', async ({ page }) => {
    await page.goto('/product-overview/1')

    const decrease = page.getByRole('button', { name: 'Decrease quantity' })
    await expect(decrease).toBeDisabled()

    await page.getByRole('button', { name: 'Increase quantity' }).click()
    // Exact match: "Decrease/Increase quantity" would otherwise also match.
    await expect(page.getByLabel('Quantity', { exact: true })).toHaveValue('2')
    await expect(decrease).toBeEnabled()
  })

  test('product images actually load', async ({ page }) => {
    await page.goto('/product-overview/1')
    const hero = page.locator('img').first()
    await expect(hero).toBeVisible()

    const loaded = await hero.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)
    expect(loaded, 'hero product image failed to load').toBe(true)
  })

  test('an unknown product id shows a recoverable not-found state', async ({ page }) => {
    await page.goto('/product-overview/does-not-exist')
    await expect(page.getByRole('heading', { name: 'Product not found' })).toBeVisible()
    await page.getByRole('button', { name: 'Browse products' }).click()
    await expect(page).toHaveURL(/\/product-grid/)
  })

  /** Guards the duplicate-id bug: `1` and `1-audio` must be different products. */
  test('products that shared an id in the source data are both reachable', async ({ page }) => {
    await page.goto('/product-overview/1')
    const first = await page.getByRole('heading', { level: 1 }).textContent()

    await page.goto('/product-overview/1-audio')
    await expect(page.getByRole('heading', { name: 'Product not found' })).toBeHidden()
    const second = await page.getByRole('heading', { level: 1 }).textContent()

    expect(second).not.toBe(first)
  })
})

test.describe('support form', () => {
  test('validates required fields then submits', async ({ page }) => {
    await page.goto('/support')

    await page.getByRole('button', { name: 'Submit Ticket' }).click()
    await expect(page.getByText('Name is required')).toBeVisible()

    await page.getByLabel('Full Name').fill('Jon Doe')
    await page.getByLabel('Email Address').fill('jon@example.com')
    await page.getByLabel('Issue Type').click()
    await page.getByRole('option', { name: 'Hardware Problem' }).click()
    await page.getByLabel('Product Model Number').fill('ROG-1234')
    await page.getByLabel('Priority Level').click()
    await page.getByRole('option', { name: 'High' }).click()
    await page.getByLabel('Description').fill('The GPU fan rattles under load.')

    await page.getByRole('button', { name: 'Submit Ticket' }).click()
    await expect(page.getByText(/ticket has been submitted/i)).toBeVisible()
  })
})

test.describe('responsive layout', () => {
  test('mobile exposes categories through the menu sheet', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'desktop renders the sidebar inline')

    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()

    const sheet = page.getByRole('dialog')
    await expect(sheet.getByText('Categories')).toBeVisible()

    await sheet.getByRole('button', { name: 'Monitors' }).click()
    await expect(page).toHaveURL(/product-grid\?category=monitors/)
  })
})
