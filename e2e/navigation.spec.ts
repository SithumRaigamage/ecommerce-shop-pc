import { expect, test } from '@playwright/test'
import { failOnPageErrors } from './helpers'

test.describe('navigation and content', () => {
  test('home page renders the carousel, categories and featured products', async ({ page }) => {
    const errors = failOnPageErrors(page)
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Shop by Featured Categories' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Featured Products' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Go to slide 1/ })).toBeVisible()

    expect(errors).toEqual([])
  })

  test('every featured product links to a real product page', async ({ page }) => {
    await page.goto('/')
    const links = page.getByRole('link', { name: 'Learn More' })
    // Featured products are fetched, so wait for the first before counting.
    await expect(links.first()).toBeVisible()
    const count = await links.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href')
      expect(href).toMatch(/^\/product-overview\/.+/)

      await page.goto(href!)
      // A missing product renders the "Product not found" fallback instead.
      await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible()
      await page.goBack()
    }
  })

  test('every banner CTA resolves to a page with products or content', async ({ page }) => {
    await page.goto('/')

    const dots = page.getByRole('button', { name: /Go to slide/ })
    await expect(dots.first()).toBeVisible()
    const slides = await dots.count()

    for (let i = 0; i < slides; i++) {
      await dots.nth(i).click()
      const cta = page.locator('section[aria-roledescription="carousel"]').getByRole('link').first()
      const href = await cta.getAttribute('href')
      expect(href, `slide ${i + 1} has no CTA href`).toBeTruthy()

      await page.goto(href!)
      await expect(page.getByRole('heading', { name: 'Page not found' })).toBeHidden()
      await page.goto('/')
    }
  })

  test('legacy /category/:slug links redirect into the product grid', async ({ page }) => {
    await page.goto('/category/graphics')
    await expect(page).toHaveURL(/\/product-grid\?category=graphics/)
    await expect(page.getByRole('link', { name: 'View Details' }).first()).toBeVisible()
  })

  test('an unknown category slug still lands on the grid rather than a 404', async ({ page }) => {
    await page.goto('/category/workstations')
    await expect(page).toHaveURL(/\/product-grid/)
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeHidden()
  })

  test('an unknown route renders the not-found page', async ({ page }) => {
    await page.goto('/no-such-page')
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })

  test('every category facet returns at least one product', async ({ page, isMobile }) => {
    test.skip(isMobile, 'the rail is inline from lg; the sheet variant is covered elsewhere')

    // The rail carries the category as a facet with live counts, so the count
    // beside each option is itself the assertion: none of them may read zero.
    await page.goto('/product-grid')
    const rail = page.getByRole('region', { name: 'Filters' })
    await expect(rail).toBeVisible()

    const group = rail.locator('fieldset').filter({ hasText: 'Category' })
    const rows = group.locator('div').filter({ has: page.getByRole('checkbox') })
    const total = await rows.count()
    expect(total).toBeGreaterThan(0)

    for (let i = 0; i < total; i++) {
      const text = await rows.nth(i).textContent()
      expect(text, `a category facet shows a zero count: ${text}`).not.toMatch(/\b0$/)
    }
  })
})
