import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { PriceDisplay } from '@/components/PriceDisplay'
import { SPEC_UNITS, specLabel, tableColumnsFor } from '@/lib/catalogue'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

const SORTABLE = new Set([
  'cores', 'threads', 'tdp', 'vram_gb', 'length_mm', 'ram_slots', 'speed', 'cas',
  'wattage', 'max_gpu_mm', 'max_cooler_mm', 'read_mbs', 'size', 'refresh',
])

function format(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

interface SortButtonProps {
  columnKey: string
  sort: string
  onSort: (next: string) => void
  children: React.ReactNode
  align?: 'left' | 'right'
}

function SortButton({ columnKey, sort, onSort, children, align = 'left' }: SortButtonProps) {
  const [activeKey, activeDir] = sort.split(':')
  const active = activeKey === columnKey
  const nextDir = active && activeDir === 'desc' ? 'asc' : 'desc'
  const Icon = !active ? ChevronsUpDown : activeDir === 'desc' ? ArrowDown : ArrowUp

  return (
    <button
      type="button"
      onClick={() => onSort(`${columnKey}:${nextDir}`)}
      aria-label={`Sort by ${String(children)}, ${nextDir === 'desc' ? 'high to low' : 'low to high'}`}
      className={cn(
        'focus-ring inline-flex items-center gap-1 rounded-xs font-medium duration-fast ease-standard transition-colors',
        align === 'right' && 'flex-row-reverse',
        active ? 'text-fg-primary' : 'text-fg-tertiary hover:text-fg-primary',
      )}
    >
      {children}
      <Icon className="size-3 shrink-0" aria-hidden="true" />
    </button>
  )
}

interface ProductTableProps {
  products: Product[]
  category: string
  sort: string
  onSort: (next: string) => void
  compare: string[]
  onToggleCompare: (id: string) => void
  compareDisabled: boolean
}

/**
 * Compact density. The card grid is for browsing; this is for comparing — one
 * row per product, one column per spec, every figure in tabular mono so a
 * column of numbers can be read down rather than one card at a time.
 */
export function ProductTable({
  products,
  category,
  sort,
  onSort,
  compare,
  onToggleCompare,
  compareDisabled,
}: ProductTableProps) {
  const columns = tableColumnsFor(category)
  const sortedBy = sort.split(':')[0]

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border-subtle">
      <table className="w-full min-w-3xl border-collapse text-sm">
        <caption className="sr-only">
          {products.length} products{category ? ` in ${category}` : ''}, sortable by specification
        </caption>
        <thead className="bg-surface-2">
          <tr className="border-b border-border-default">
            <th scope="col" className="w-10 p-3">
              <span className="sr-only">Compare</span>
            </th>
            <th scope="col" className="p-3 text-left">
              <SortButton columnKey="title" sort={sort} onSort={onSort}>
                Product
              </SortButton>
            </th>
            {columns.map((key) => (
              <th key={key} scope="col" className="p-3 text-right whitespace-nowrap">
                {SORTABLE.has(key) ? (
                  <SortButton columnKey={key} sort={sort} onSort={onSort} align="right">
                    {specLabel(key)}
                  </SortButton>
                ) : (
                  <span className="font-medium text-fg-tertiary">{specLabel(key)}</span>
                )}
              </th>
            ))}
            <th scope="col" className="p-3 text-right whitespace-nowrap">
              <SortButton columnKey="price" sort={sort} onSort={onSort} align="right">
                Price
              </SortButton>
            </th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const selected = compare.includes(product.id)
            return (
              <tr
                key={product.id}
                data-selected={selected || undefined}
                className={cn(
                  'border-b border-border-subtle last:border-b-0',
                  'duration-fast ease-standard transition-colors hover:bg-surface-2',
                  selected && 'bg-surface-2',
                )}
              >
                <td className="p-3">
                  <Checkbox
                    checked={selected}
                    disabled={compareDisabled && !selected}
                    onCheckedChange={() => onToggleCompare(product.id)}
                    aria-label={`Compare ${product.title}`}
                  />
                </td>
                <th scope="row" className="max-w-sm p-3 text-left font-normal">
                  <Link
                    to={`/product-overview/${product.id}`}
                    className="focus-ring rounded-xs font-medium text-fg-primary hover:text-accent-default"
                  >
                    {product.title}
                  </Link>
                  <span className="block text-xs text-fg-tertiary">{product.brand}</span>
                </th>
                {columns.map((key) => (
                  <td
                    key={key}
                    className={cn(
                      'p-3 text-right whitespace-nowrap',
                      sortedBy === key ? 'text-fg-primary' : 'text-fg-secondary',
                    )}
                  >
                    <span className="numeric" data-numeric>
                      {format(product.specs?.[key])}
                    </span>
                    {SPEC_UNITS[key] && (
                      <span className="ml-1 text-fg-tertiary">{SPEC_UNITS[key]}</span>
                    )}
                  </td>
                ))}
                <td className="p-3 text-right">
                  <PriceDisplay value={product.price} size="sm" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Row count and column count match the real table, so the swap does not shift. */
export function ProductTableSkeleton({ category, rows = 8 }: { category: string; rows?: number }) {
  const columns = tableColumnsFor(category)
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border-subtle" aria-hidden="true">
      <div className="flex items-center gap-3 border-b border-border-default bg-surface-2 p-3">
        <Skeleton className="size-4" />
        <Skeleton className="h-4 w-40" />
        <div className="ml-auto flex gap-6">
          {columns.map((key) => (
            <Skeleton key={key} className="h-4 w-14" />
          ))}
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border-subtle p-3 last:border-b-0">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-64" />
          <div className="ml-auto flex gap-6">
            {columns.map((key) => (
              <Skeleton key={key} className="h-4 w-14" />
            ))}
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
