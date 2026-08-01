import { expect, test } from '@playwright/test'

test.describe('product imagery', () => {
  test('every card carries a designed placeholder naming its part number', async ({ page }) => {
    await page.goto('/product-grid?category=processor')

    const cards = page.locator('[data-slot="product-placeholder"]')
    await expect(cards.first()).toBeVisible()
    await expect(cards).toHaveCount(6)

    // Designed, not broken: the MPN is what a buyer would search to find the
    // manufacturer's own photo, so the placeholder is informative on its own.
    await expect(cards.first()).toHaveText(/[A-Z0-9-]{4,}/)
  })

  test('placeholders share the card geometry, so the grid stays aligned', async ({ page }) => {
    await page.goto('/product-grid?category=graphics')

    const placeholders = page.locator('[data-slot="product-placeholder"]')
    await expect(placeholders.first()).toBeVisible()

    const boxes = await placeholders.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().width),
    )

    expect(boxes.length).toBeGreaterThan(1)
    // Every media box on a row is the same width; a grid where imagery sets its
    // own size is the thing that reads as a template with content poured in.
    expect(new Set(boxes.map((w) => Math.round(w))).size).toBe(1)
  })

  test('renders no broken image anywhere in the catalogue', async ({ page }) => {
    for (const url of ['/', '/product-grid', '/product-overview/amd-ryzen-7-9800x3d']) {
      await page.goto(url)
      await page.waitForLoadState('networkidle')

      const broken = await page.locator('img').evaluateAll((imgs) =>
        imgs
          .filter((img) => {
            const image = img as HTMLImageElement
            return !image.complete || image.naturalWidth === 0
          })
          .map((img) => (img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src),
      )
      expect(broken, `broken images on ${url}`).toEqual([])
    }
  })

  test('serves no imagery from a third-party host', async ({ page }) => {
    const external: string[] = []
    page.on('request', (request) => {
      if (request.resourceType() !== 'image') return
      const { host } = new URL(request.url())
      if (host !== new URL(page.url() || 'http://localhost').host) external.push(request.url())
    })

    await page.goto('/product-grid')
    await page.waitForLoadState('networkidle')

    // The previous catalogue hotlinked a retailer's CDN for 287 of 299 images.
    expect(external).toEqual([])
  })

  test('the placeholder is legible in both themes', async ({ page }) => {
    await page.goto('/product-grid?category=storage')
    const placeholder = page.locator('[data-slot="product-placeholder"]').first()

    const colours = async () =>
      placeholder.evaluate((el) => {
        const style = getComputedStyle(el)
        return { bg: style.backgroundColor, fg: style.color }
      })

    const dark = await colours()
    await page.emulateMedia({ colorScheme: 'light' })
    await page.evaluate(() => {
      localStorage.setItem('pc-shop-theme', 'light')
    })
    await page.reload()
    await expect(placeholder).toBeVisible()
    const light = await colours()

    // Drawn from tokens rather than baked into a raster, so both themes are
    // real rather than one being the other with a filter over it.
    expect(light.bg).not.toBe(dark.bg)
    expect(light.fg).not.toBe(dark.fg)
  })
})
