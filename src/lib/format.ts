const lkr = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Mirrors the Angular `| currency:'LKR'` pipe used across the old templates. */
export function formatLKR(value: number | undefined | null): string {
  return lkr.format(value ?? 0)
}

/**
 * The JSON fixtures store Angular-style relative paths ("assets/products/ps5.png").
 * Those only resolved because Angular served from `/`; under client-side routing a
 * relative path breaks on nested routes, so normalise everything to root-absolute.
 */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (/^(https?:)?\/\//.test(path) || path.startsWith('/') || path.startsWith('data:')) {
    return path
  }
  return `/${path}`
}
