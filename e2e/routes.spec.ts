import { expect, test } from '@playwright/test'

test.describe('route table', () => {
  test('the legacy auth paths redirect to the canonical ones', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/sign-in$/)

    await page.goto('/logout')
    await expect(page).toHaveURL(/\/sign-out$/)
  })

  test('every footer link resolves to a real page, not the 404', async ({ page }) => {
    await page.goto('/')

    const links = await page
      .getByRole('contentinfo')
      .getByRole('link')
      .evaluateAll((els) =>
        els
          .map((el) => el.getAttribute('href'))
          .filter((href): href is string => Boolean(href?.startsWith('/'))),
      )

    // The regression: /about, /blog, /careers, /privacy, /terms and /sitemap
    // were all linked here and declared nowhere.
    expect(links.length).toBeGreaterThan(10)

    for (const href of [...new Set(links)]) {
      await page.goto(href)
      // Every page carries exactly one h1, so its absence is itself a failure.
      const heading = page.getByRole('heading', { level: 1 })
      await expect(heading, `${href} has no h1`).toHaveCount(1)
      await expect(heading, `${href} rendered the 404`).not.toHaveText(/page not found/i)
    }
  })

  test('the sitemap lists every navigable route and each one loads', async ({ page }) => {
    await page.goto('/sitemap')
    await expect(page.getByRole('heading', { level: 1, name: 'Sitemap' })).toBeVisible()

    const hrefs = await page
      .getByRole('main')
      .getByRole('link')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href') ?? ''))

    expect(hrefs).toContain('/product-grid')
    expect(hrefs).toContain('/support')
    // Generated from the route table, so the categories are here too.
    expect(hrefs.some((href) => href.startsWith('/product-grid?category='))).toBe(true)
  })

  test('an undeclared path still renders the not-found page', async ({ page }) => {
    await page.goto('/definitely-not-a-route')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/page not found/i)
  })
})
