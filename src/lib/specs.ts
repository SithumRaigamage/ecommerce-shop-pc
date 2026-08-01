import type { SpecRowDef, SpecValue } from '@/components/SpecTable'

/** Builds SpecTable rows from a product's `specs` object, in insertion order. */
export function specRowsFrom(
  specs: Record<string, SpecValue>,
  units: Record<string, string> = {},
): SpecRowDef[] {
  return Object.keys(specs).map((key) => ({
    key,
    label: key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()),
    unit: units[key],
  }))
}
