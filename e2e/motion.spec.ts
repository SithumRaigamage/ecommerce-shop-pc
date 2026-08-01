import { expect, test, type Page } from '@playwright/test'

// Two Intel parts: socket and TDP agree, price/cores/threads differ. The one
// comparison that exercises both branches of the diff.
const TWO_INTEL =
  '/product-grid?category=processor&compare=intel-core-i9-14900k,intel-core-i7-14700k'

async function openCompare(page: Page) {
  await page.goto(TWO_INTEL)
  await page.getByRole('button', { name: 'Compare', exact: true }).click()
  const table = page.getByRole('dialog').locator('[data-slot="spec-table"]')
  await expect(table).toBeVisible()
  return table
}

/**
 * Computed colour of a class as Oklab components, so assertions compare rendered
 * values rather than token text.
 *
 * Oklab and not the raw string: an element whose colour comes from an animation
 * fill serialises as `oklab(L a b)` while the same colour set statically
 * serialises as `oklch(L C H)`. They are the same colour, so a string
 * comparison would fail on a difference that does not exist on screen.
 */
async function colourOf(page: Page, className: string) {
  return page.evaluate((cls) => {
    const probe = document.createElement('span')
    probe.className = cls
    document.body.append(probe)
    const colour = getComputedStyle(probe).color
    probe.remove()
    return colour
  }, className)
}

function toOklab(colour: string): [number, number, number] {
  const [x, y, z] = colour
    .replace(/^okl(ch|ab)\(|\)$/g, '')
    .split(/[\s/]+/)
    .map(Number)
  if (colour.startsWith('oklab')) return [x, y, z]
  const radians = (z * Math.PI) / 180
  return [x, y * Math.cos(radians), y * Math.sin(radians)]
}

/** Same rendered colour, whichever way the browser chose to serialise it. */
function expectSameColour(actual: string, expected: string) {
  const a = toOklab(actual)
  const b = toOklab(expected)
  for (let i = 0; i < 3; i++) expect(a[i]).toBeCloseTo(b[i], 3)
}

/** Every animation has run to completion — the settled state, not a frame of it. */
async function settled(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState === 'finished' || a.playState === 'idle'),
  )
}

const colourAt = (page: Page, selector: string, nth = 0) =>
  page.evaluate(
    ([sel, i]) => getComputedStyle(document.querySelectorAll(sel)[i as number]).color,
    [selector, nth] as const,
  )

test.describe('compare diff reveal', () => {
  test('rows settle to muted where they agree and full contrast where they differ', async ({
    page,
  }) => {
    const table = await openCompare(page)
    const rowFor = (label: string) => table.locator('tbody tr').filter({ hasText: label })

    // Socket is LGA1700 on both, so it must not be flagged as a difference.
    await expect(rowFor('Socket')).not.toHaveAttribute('data-differs', 'true')
    await expect(rowFor('Cores')).toHaveAttribute('data-differs', 'true')

    const muted = await colourOf(page, 'text-fg-tertiary')
    const bright = await colourOf(page, 'text-fg-primary')
    expect(muted).not.toBe(bright)

    // The end state, once the stagger has finished.
    await settled(page)
    expectSameColour(await colourAt(page, '[data-slot="spec-table"] tbody tr', 1), muted)
    expectSameColour(await colourAt(page, '[data-slot="spec-table"] tbody tr td', 0), bright)
  })

  test('marks the better value and only where better is defined', async ({ page }) => {
    const table = await openCompare(page)
    const rowFor = (label: string) => table.locator('tbody tr').filter({ hasText: label })

    // 24 cores beats 20, and the i9 is the first column.
    await expect(rowFor('Cores').locator('td').first()).toHaveAttribute('data-winner', 'true')
    await expect(rowFor('Cores').locator('td').nth(1)).not.toHaveAttribute('data-winner', 'true')

    // Cheaper is better, and the i7 is the cheaper of the two.
    await expect(rowFor('Price').locator('td').nth(1)).toHaveAttribute('data-winner', 'true')

    // A socket has no better. Both parse to a number, so this is the assertion
    // that catches a regression where direction stops gating the marker.
    await expect(rowFor('Socket').locator('[data-winner]')).toHaveCount(0)
    // TDP ties at 125 W across both, and a whole-row tie is not a win.
    await expect(rowFor('TDP').locator('[data-winner]')).toHaveCount(0)
  })

  test('the reveal is staggered, and every row is offset from the one above it', async ({
    page,
  }) => {
    const table = await openCompare(page)
    const delays = await table.locator('tbody tr').evaluateAll((rows) =>
      rows.map((row) => Number.parseFloat(getComputedStyle(row).animationDelay)),
    )

    expect(delays.length).toBeGreaterThan(2)
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i], `row ${i} must start after row ${i - 1}`).toBeGreaterThan(delays[i - 1])
    }
    // 25ms steps, and the whole table is resolved well inside a second.
    expect(delays.at(-1)! - delays[0]).toBeCloseTo(0.025 * (delays.length - 1), 3)
    expect(delays.at(-1)!).toBeLessThan(0.5)
  })
})

test.describe('reduced motion', () => {
  test('is an instant state change, not a shorter animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const table = await openCompare(page)
    const rows = table.locator('tbody tr')

    // No delay at all: the last row must already be resolved, not queued behind
    // a stagger that has merely been sped up.
    const state = await rows.evaluateAll((els) =>
      els.map((el) => ({
        delay: Number.parseFloat(getComputedStyle(el).animationDelay),
        duration: Number.parseFloat(getComputedStyle(el).animationDuration),
        opacity: Number.parseFloat(getComputedStyle(el).opacity),
      })),
    )
    for (const row of state) {
      expect(row.delay).toBe(0)
      expect(row.duration).toBeLessThanOrEqual(0.001)
      expect(row.opacity).toBe(1)
    }

    // The information still arrives — only the motion is gone.
    await settled(page)
    expectSameColour(
      await colourAt(page, '[data-slot="spec-table"] tbody tr', 1),
      await colourOf(page, 'text-fg-tertiary'),
    )
    await expect(
      rows.filter({ hasText: 'Cores' }).locator('td').first(),
    ).toHaveAttribute('data-winner', 'true')
  })
})

test.describe('systematic motion', () => {
  test('the result count is announced when filters change', async ({ page }) => {
    await page.goto('/product-grid')

    const live = page.locator('[aria-live="polite"]').filter({ hasText: /product/ })
    await expect(live).toBeVisible()
    const before = await live.textContent()

    await page.goto('/product-grid?category=processor')
    await expect(live).not.toHaveText(before ?? '')
    await expect(live).toContainText('6 products')
  })

  test('no state change anywhere takes longer than 400ms', async ({ page }) => {
    await page.goto('/product-grid?category=processor')

    // The brief's ceiling, checked against computed values: a token can be
    // referenced correctly and still resolve to the wrong number.
    //
    // Looping animations are excluded, and the distinction is the point. The
    // skeleton pulse runs at 2s forever because it is an indicator that work is
    // ongoing, not a transition between two states. The ceiling governs motion
    // you wait through; nobody waits for a pulse to finish.
    const worst = await page.evaluate(() =>
      Array.from(document.querySelectorAll('*'))
        .flatMap((el) => {
          const cs = getComputedStyle(el)
          const loops = cs.animationIterationCount.split(', ')
          const animations = cs.animationDuration
            .split(', ')
            .filter((_, i) => (loops[i] ?? loops[0]) !== 'infinite')
          return [...animations, ...cs.transitionDuration.split(', ')].map(
            (v) => Number.parseFloat(v) || 0,
          )
        })
        .reduce((max, value) => Math.max(max, value), 0),
    )
    expect(worst).toBeLessThanOrEqual(0.4)
  })
})
