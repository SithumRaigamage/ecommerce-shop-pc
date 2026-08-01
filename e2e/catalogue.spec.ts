import { expect, test } from '@playwright/test'
import { closeFilters, failOnPageErrors, filterScope, openFilters } from './helpers'

test.describe('filter rail', () => {
  test('facet counts respond to the other active facets', async ({ page, isMobile }) => {
    await page.goto('/product-grid')
    await openFilters(page, isMobile)

    const rail = filterScope(page, isMobile)
    const brands = rail.locator('fieldset').filter({ hasText: 'Brand' })
    const before = await brands.textContent()

    // `.click()` not `.check()`: these checkboxes are controlled by the URL, so
    // state lands a tick later than `.check()`'s synchronous verification.
    await rail.getByLabel('Processors', { exact: false }).click()
    await expect(page).toHaveURL(/category=processor/)
    await expect(brands).not.toHaveText(before ?? '')
  })

  test('a facet that would return nothing is disabled, not hidden', async ({ page, isMobile }) => {
    await page.goto('/product-grid?category=processor&brand=AMD')
    await openFilters(page, isMobile)

    const rail = filterScope(page, isMobile)
    const sockets = rail.locator('fieldset').filter({ hasText: 'Socket' })
    await expect(sockets).toBeVisible()
    // AMD processors are AM5 only, so LGA1700 must still be listed at zero.
    await expect(sockets).toContainText('LGA1700')
    await expect(sockets.getByLabel('LGA1700')).toBeDisabled()
  })

  test('spec facets are category-specific', async ({ page, isMobile }) => {
    await page.goto('/product-grid?category=processor')
    await openFilters(page, isMobile)
    const rail = filterScope(page, isMobile)
    await expect(rail.locator('fieldset').filter({ hasText: 'Socket' })).toBeVisible()

    await page.goto('/product-grid?category=monitors')
    await openFilters(page, isMobile)
    const rail2 = filterScope(page, isMobile)
    await expect(rail2.locator('fieldset').filter({ hasText: 'Socket' })).toBeHidden()
    await expect(rail2.locator('fieldset').filter({ hasText: 'Panel' })).toBeVisible()
  })
})

test.describe('density', () => {
  test('compact renders a sortable table and survives a reload', async ({ page }) => {
    await page.goto('/product-grid?category=processor&density=compact')

    const table = page.getByRole('table')
    await expect(table).toBeVisible()
    await expect(table.getByRole('columnheader', { name: /Cores/ })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('sorting by a spec column reorders rows and writes the URL', async ({ page }) => {
    await page.goto('/product-grid?category=processor&density=compact')

    const firstCell = () => page.getByRole('table').locator('tbody tr').first()
    const before = await firstCell().textContent()

    await page.getByRole('button', { name: /Sort by Cores/ }).click()
    await expect(page).toHaveURL(/sort=cores%3Adesc|sort=cores:desc/)

    // 24-core i9 sorts to the top when cores are ranked high to low.
    await expect(firstCell()).toContainText('i9-14900K')
    expect(await firstCell().textContent()).not.toBe(before)
  })

  test('toggling density keeps the result set', async ({ page }) => {
    await page.goto('/product-grid?category=graphics')
    await expect(page.getByRole('link', { name: 'View Details' }).first()).toBeVisible()
    const count = await page.getByRole('link', { name: 'View Details' }).count()

    await page.getByRole('button', { name: 'Compact' }).click()
    await expect(page).toHaveURL(/density=compact/)
    await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(count)
  })
})

test.describe('compare tray', () => {
  test('selects up to four and opens SpecTable in diff mode', async ({ page }) => {
    const errors = failOnPageErrors(page)
    await page.goto('/product-grid?category=processor&density=compact')

    const boxes = page.getByRole('checkbox', { name: /^Compare / })
    const tray = page.getByRole('list', { name: 'Products selected for comparison' })

    // Controlled by the URL, so click and wait for the tray to catch up.
    for (let i = 0; i < 4; i++) {
      await boxes.nth(i).click()
      await expect(tray.getByRole('listitem')).toHaveCount(i + 1)
    }

    // Capped at four: a fifth must be unavailable rather than silently ignored.
    await expect(boxes.nth(4)).toBeDisabled()

    await page.getByRole('button', { name: 'Compare', exact: true }).click()
    const sheet = page.getByRole('dialog')
    await expect(sheet.locator('[data-slot="spec-table"]')).toBeVisible()
    await expect(sheet.locator('tr[data-differs]').first()).toBeVisible()

    expect(errors).toEqual([])
  })

  test('a comparison is a shareable URL', async ({ page }) => {
    await page.goto(
      '/product-grid?compare=amd-ryzen-7-9800x3d,intel-core-i9-14900k',
    )
    const tray = page.getByRole('list', { name: 'Products selected for comparison' })
    await expect(tray.getByRole('listitem')).toHaveCount(2)
  })
})

test.describe('empty state', () => {
  test('names the filter to relax and clearing it recovers results', async ({ page, isMobile }) => {
    // No graphics card is this cheap, so the price cap is the culprit.
    await page.goto('/product-grid?category=graphics&maxPrice=5000')
    await closeFilters(page, isMobile)

    const empty = page.getByText('No products match these filters')
    await expect(empty).toBeVisible()
    await expect(page.getByText(/Relaxing the price cap would show \d+ product/)).toBeVisible()

    await page.getByRole('button', { name: /Clear the price cap/ }).click()
    await expect(page.getByRole('link', { name: 'View Details' }).first()).toBeVisible()
  })
})

test.describe('layout', () => {
  test('uses the extra width at 2xl instead of adding gutter', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop breakpoint behaviour')

    await page.goto('/product-grid?category=storage')
    const cardsPerRow = async () => {
      await expect(page.getByRole('link', { name: 'View Details' }).first()).toBeVisible()
      return page.getByRole('link', { name: 'View Details' }).evaluateAll((els) => {
        const tops = els.map((e) => Math.round(e.getBoundingClientRect().top))
        return tops.filter((t) => t === tops[0]).length
      })
    }

    await page.setViewportSize({ width: 1280, height: 900 })
    const atXl = await cardsPerRow()

    await page.setViewportSize({ width: 1800, height: 900 })
    const at2xl = await cardsPerRow()

    expect(at2xl, 'a wider display must show more results per row').toBeGreaterThan(atXl)
  })

  test('no global category rail remains on other pages', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Product categories' })).toBeHidden()
  })
})
