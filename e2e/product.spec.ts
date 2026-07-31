import { expect, test } from '@playwright/test'
import { failOnPageErrors } from './helpers'

test.describe('product discovery', () => {
  test('filters the grid by maximum price', async ({ page }) => {
    await page.goto('/product-grid?category=processor')

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

  test('product detail renders the category specs', async ({ page }) => {
    const errors = failOnPageErrors(page)
    await page.goto('/product-overview/amd-ryzen-7-9800x3d')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Specifications' })).toBeVisible()

    // Every CPU must carry socket/cores/threads/tdp — see catalogue-schema.ts.
    for (const label of ['Socket', 'Cores', 'Threads', 'Tdp']) {
      await expect(page.getByRole('term').filter({ hasText: label })).toBeVisible()
    }
    await expect(page.getByText('AM5')).toBeVisible()

    // The seed carries no FAQs yet; the tab must say so rather than render blank.
    await page.getByRole('tab', { name: 'FAQ' }).click()
    await expect(page.getByText('No FAQs available.')).toBeVisible()

    expect(errors).toEqual([])
  })

  test('quantity stepper will not go below one', async ({ page }) => {
    await page.goto('/product-overview/amd-ryzen-7-9800x3d')

    const decrease = page.getByRole('button', { name: 'Decrease quantity' })
    await expect(decrease).toBeDisabled()

    await page.getByRole('button', { name: 'Increase quantity' }).click()
    // Exact match: "Decrease/Increase quantity" would otherwise also match.
    await expect(page.getByLabel('Quantity', { exact: true })).toHaveValue('2')
    await expect(decrease).toBeEnabled()
  })

  /**
   * Catalogue imagery is sourced in a later stage, so `image` is null. What must
   * hold now is that the placeholder is labelled rather than rendering a broken
   * image box; when real imagery lands this should assert naturalWidth again.
   */
  test('missing product imagery falls back to a labelled placeholder', async ({ page }) => {
    await page.goto('/product-overview/amd-ryzen-7-9800x3d')

    const placeholder = page.getByRole('img', { name: 'AMD Ryzen 7 9800X3D' })
    await expect(placeholder).toBeVisible()

    const brokenImages = await page.locator('img').evaluateAll((imgs) =>
      imgs.filter((img) => !(img as HTMLImageElement).complete || (img as HTMLImageElement).naturalWidth === 0).length,
    )
    expect(brokenImages, 'no broken <img> should be rendered').toBe(0)
  })

  test('an unknown product id shows a recoverable not-found state', async ({ page }) => {
    await page.goto('/product-overview/does-not-exist')
    await expect(page.getByRole('heading', { name: 'Product not found' })).toBeVisible()
    await page.getByRole('button', { name: 'Browse products' }).click()
    await expect(page).toHaveURL(/\/product-grid/)
  })

  test('every category in the sidebar returns products with a working detail page', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'sidebar is collapsed into a sheet on mobile')

    await page.goto('/product-grid?category=graphics')
    const first = page.getByRole('link', { name: 'View Details' }).first()
    await expect(first).toBeVisible()
    await first.click()

    await page.waitForURL('**/product-overview/**')
    await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Product not found' })).toBeHidden()
  })
})

test.describe('filter state in the URL', () => {
  test('writes the price filter to the query string', async ({ page }) => {
    await page.goto('/product-grid?category=processor')

    const slider = page.getByRole('slider', { name: 'Maximum price' })
    await slider.focus()
    await slider.press('Home')

    await expect(page).toHaveURL(/maxPrice=0/)
    await expect(page).toHaveURL(/category=processor/)
  })

  test('survives a reload', async ({ page }) => {
    await page.goto('/product-grid?category=processor&maxPrice=100000')
    const cards = page.getByRole('link', { name: 'View Details' })
    await expect(cards.first()).toBeVisible()
    const filtered = await cards.count()

    await page.reload()
    await expect(cards).toHaveCount(filtered)
  })

  test('is restored by browser back', async ({ page }) => {
    await page.goto('/product-grid?category=processor&maxPrice=100000')
    const cards = page.getByRole('link', { name: 'View Details' })
    await expect(cards.first()).toBeVisible()
    const filtered = await cards.count()

    await cards.first().click()
    await page.waitForURL('**/product-overview/**')
    await page.goBack()

    await expect(page).toHaveURL(/maxPrice=100000/)
    await expect(cards).toHaveCount(filtered)
  })

  test('a shared URL reproduces the same filtered result', async ({ page }) => {
    await page.goto('/product-grid?category=processor&maxPrice=80000')
    const cards = page.getByRole('link', { name: 'View Details' })
    await expect(cards.first()).toBeVisible()

    // Only the Ryzen 5 7600 (78,000) is under 80,000 in the processor category.
    await expect(cards).toHaveCount(1)
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
