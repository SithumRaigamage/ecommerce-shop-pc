/**
 * Stock as an enum rather than free text. The competitor audit found "In Stock",
 * "In stock", "Available" and "2 left!" all in use for three underlying states;
 * free text cannot be filtered, sorted or translated. `StockIndicator` is the
 * only thing that renders these.
 */
export type StockState = 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued'

/** Stock states that permit adding to a cart. */
export function isPurchasable(state: StockState): boolean {
  return state === 'in-stock' || state === 'low-stock'
}
