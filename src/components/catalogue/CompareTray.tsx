import { useState, type CSSProperties } from 'react'
import { Columns3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Cluster } from '@/components/layout/primitives'
import { PriceDisplay } from '@/components/PriceDisplay'
import { SpecTable, type SpecColumnDef } from '@/components/SpecTable'
import { BETTER_DIRECTION, MAX_COMPARE, SPEC_UNITS, specLabel } from '@/lib/catalogue'
import { CATEGORY_SPEC_FIELDS } from '@/lib/catalogue-schema'
import type { Product } from '@/types'

interface CompareTrayProps {
  products: Product[]
  onRemove: (id: string) => void
  onClear: () => void
}

/**
 * The stagger waits for the sheet to land. Measured without this, rows one to
 * three resolved while the panel was still travelling and mid-overshoot, and
 * the two motions read as a single smear.
 *
 * --duration-fast, not --duration-base, and the difference is the whole point:
 * the sheet settles at ~141ms, so a 150ms offset hands off in 17ms — the panel
 * stops and the first row arrives, one continuous gesture, everything resolved
 * by 441ms. A 250ms offset measured a 115ms hole in the middle, which reads as
 * a hitch rather than a beat, and pushed the end out to 543ms.
 */
const REVEAL_AFTER_SHEET = { '--motion-offset': 'var(--duration-fast)' } as CSSProperties

/**
 * Docked tray rather than a modal: building a comparison is something you do
 * *while* scanning results, so the grid has to stay visible and interactive.
 * The tray only opens the full SpecTable on demand.
 */
export function CompareTray({ products, onRemove, onClear }: CompareTrayProps) {
  const [open, setOpen] = useState(false)
  if (products.length === 0) return null

  // Rows come from the shared category when there is one; comparing across
  // categories falls back to the union, where "—" is itself informative.
  const categories = new Set(products.map((p) => p.category))
  const specKeys =
    categories.size === 1
      ? [...(CATEGORY_SPEC_FIELDS[products[0].category] ?? [])]
      : [...new Set(products.flatMap((p) => Object.keys(p.specs ?? {})))]

  const rows = [
    { key: '__price', label: 'Price' },
    ...specKeys.map((key) => ({ key, label: specLabel(key), unit: SPEC_UNITS[key] })),
  ]

  const columns: SpecColumnDef[] = products.map((product) => ({
    id: product.id,
    title: product.title,
    values: { __price: product.price.toLocaleString('en-LK'), ...(product.specs ?? {}) },
  }))

  return (
    <>
      <div className="sticky bottom-0 z-30 -mx-gutter mt-gutter border-t border-border-default bg-surface-1 px-gutter py-3">
        <Cluster justify="between" gap="default">
          <Cluster gap="tight">
            <span className="text-sm font-medium text-fg-primary">
              Comparing{' '}
              <span className="numeric" data-numeric>
                {products.length}
              </span>
              <span className="text-fg-tertiary"> / {MAX_COMPARE}</span>
            </span>

            <Cluster gap="tight" role="list" aria-label="Products selected for comparison">
              {products.map((product) => (
                <span
                  key={product.id}
                  role="listitem"
                  className="inline-flex h-6 max-w-48 items-center gap-1.5 rounded-full border border-border-default bg-surface-2 pr-1 pl-2.5 text-xs"
                >
                  <span className="truncate text-fg-primary">{product.title}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(product.id)}
                    aria-label={`Remove ${product.title} from comparison`}
                    className="focus-ring inline-flex size-4 shrink-0 items-center justify-center rounded-full text-fg-tertiary duration-fast ease-standard transition-colors hover:bg-surface-3 hover:text-fg-primary"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </Cluster>
          </Cluster>

          <Cluster gap="tight">
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
            <Button size="sm" onClick={() => setOpen(true)} disabled={products.length < 2}>
              <Columns3 />
              Compare
            </Button>
          </Cluster>
        </Cluster>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-sidebar overflow-y-auto sm:max-w-none">
          <SheetHeader>
            <SheetTitle>
              Comparing{' '}
              <span className="numeric" data-numeric>
                {products.length}
              </span>{' '}
              products
            </SheetTitle>
          </SheetHeader>

          <div className="px-card-padding pb-card-padding">
            <Cluster gap="gutter" className="mb-gutter">
              {products.map((product) => (
                <div key={product.id} className="min-w-48">
                  <p className="text-xs text-fg-tertiary">{product.brand}</p>
                  <p className="text-sm font-medium text-fg-primary">{product.title}</p>
                  <PriceDisplay value={product.price} size="sm" />
                </div>
              ))}
            </Cluster>

            {/*
              The signature moment. `revealKey` is the identity of the compared
              set, so the staggered resolve replays when the set changes and
              never on an unrelated re-render.
            */}
            <div style={REVEAL_AFTER_SHEET}>
              <SpecTable
                rows={rows}
                columns={columns}
                diff
                betterDirection={BETTER_DIRECTION}
                revealKey={products.map((p) => p.id).join('|')}
                caption="Product comparison"
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
