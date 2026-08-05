import { expect, type Page } from '@playwright/test'

/**
 * Fails the test on any console error or failed same-origin request. Broken
 * images and missing JSON fixtures are the failure mode this app is most prone
 * to, and they otherwise pass silently.
 */
export function failOnPageErrors(page: Page): string[] {
  const errors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`)
  })
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))
  page.on('response', (res) => {
    if (res.status() >= 400 && new URL(res.url()).origin === new URL(page.url() || res.url()).origin) {
      errors.push(`[http ${res.status()}] ${res.url()}`)
    }
  })

  return errors
}

/** Adds the first product of a category to the cart and returns its title. */
export async function addFirstProductToCart(page: Page, category: string): Promise<string> {
  await page.goto(`/product-grid?category=${category}`)

  const firstProduct = page.getByRole('link', { name: 'View Details' }).first()
  await expect(firstProduct).toBeVisible()
  await firstProduct.click()
  await page.waitForURL('**/product-overview/**')

  // Wait for the detail page to mount before reading its heading — the grid's
  // own <h1> is still in the tree at the moment the URL changes.
  const addToCart = page.getByRole('button', { name: 'Add to cart' })
  await expect(addToCart).toBeVisible()

  const title = (await page.getByRole('heading', { level: 1 }).first().textContent()) ?? ''
  await addToCart.click()
  // `.first()`: a toast from a previous add may still be on screen, and two
  // identical toasts would otherwise trip Playwright's strict mode.
  await expect(page.getByText('Product added to cart successfully!').first()).toBeVisible()

  return title.trim()
}

export async function openCart(page: Page) {
  await page.getByRole('button', { name: 'Open cart' }).click()
  return page.getByRole('dialog')
}


/**
 * The filter rail is inline from lg and inside a sheet below it. Opens the
 * sheet when needed so a test can drive facets at any viewport.
 */
export async function openFilters(page: Page, isMobile: boolean | undefined) {
  if (!isMobile) return
  await page.getByRole('button', { name: /Filters/ }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
}

/** The rail is a labelled region inline, and lives inside the sheet on mobile. */
export function filterScope(page: Page, isMobile: boolean | undefined) {
  return isMobile ? page.getByRole('dialog') : page.getByRole('region', { name: 'Filters' })
}

/** Dismisses the filter sheet so the results behind it can be asserted. */
export async function closeFilters(page: Page, isMobile: boolean | undefined) {
  if (!isMobile) return
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
}
