import { expect, test } from '@playwright/test'
import { failOnPageErrors } from './helpers'

/**
 * The styleguide renders every component in every state, so it is the cheapest
 * regression net in the suite: if a component throws, this catches it before a
 * page does.
 */
test.describe('styleguide', () => {
  test('renders every section without a console or render error', async ({ page }) => {
    const errors = failOnPageErrors(page)
    await page.goto('/styleguide')

    for (const heading of [
      'Tokens',
      'Button',
      'Card',
      'Form controls',
      'Overlays and navigation',
      'PriceDisplay',
      'StatBadge',
      'StockIndicator',
      'SpecTable',
      'FilterChip',
      'EmptyState and ErrorState',
    ]) {
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    }

    // The ErrorBoundary fallback must not have been hit.
    await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeHidden()
    expect(errors).toEqual([])
  })

  test('focus-visible is a 2px accent ring at 2px offset, never suppressed', async ({ page }) => {
    await page.goto('/styleguide')

    // Walk the first interactive controls and assert each shows a real outline.
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      const ring = await page.evaluate(() => {
        const el = document.activeElement
        if (!el || el === document.body) return null
        const cs = getComputedStyle(el)
        return { width: cs.outlineWidth, style: cs.outlineStyle, offset: cs.outlineOffset }
      })
      if (!ring) continue
      expect(ring.style, 'focus outline must not be none').not.toBe('none')
      expect(ring.width).toBe('2px')
      expect(ring.offset).toBe('2px')
    }
  })

  test('theme switch repaints both themes', async ({ page }) => {
    await page.goto('/styleguide')

    await page.getByRole('button', { name: 'Light' }).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)

    await page.getByRole('button', { name: 'Dark' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)

    expect(light).not.toBe(dark)
  })

  test('SpecTable marks differing rows and can filter to them', async ({ page }) => {
    await page.goto('/styleguide')

    const table = page.locator('[data-slot="spec-table"]').nth(1)
    await expect(table).toBeVisible()

    // Socket differs (AM5 / LGA1700 / AM5); every row here differs.
    await expect(table.locator('tr[data-differs]')).not.toHaveCount(0)

    const before = await table.locator('tbody tr').count()
    await page.getByLabel('Show differences only').check()
    await expect(table.locator('tbody tr')).toHaveCount(before)
  })

  test('renders at mobile width without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/styleguide')
    await expect(page.getByRole('heading', { name: 'SpecTable' })).toBeVisible()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    )
    expect(overflow, 'styleguide must not scroll horizontally at 390px').toBe(false)
  })
})
