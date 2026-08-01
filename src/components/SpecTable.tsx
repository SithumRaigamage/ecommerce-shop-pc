import * as React from 'react'
import { cn } from '@/lib/utils'

export type SpecValue = string | number | string[] | null | undefined

export interface SpecRowDef {
  /** Key into each column's `values`. */
  key: string
  /** Human label, sans stack. */
  label: string
  /** Unit suffix — rendered in its own aligned column so units line up. */
  unit?: string
}

export interface SpecColumnDef {
  id: string
  title: string
  values: Record<string, SpecValue>
}

interface SpecTableProps {
  rows: SpecRowDef[]
  columns: SpecColumnDef[]
  /**
   * Highlight rows whose values differ across columns. Only meaningful with two
   * or more columns; ignored otherwise.
   */
  diff?: boolean
  /** With `diff`, hide rows where every column agrees. */
  diffOnly?: boolean
  caption?: string
  className?: string
}

function formatValue(value: SpecValue): string {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

/** A row differs when its formatted values are not all identical. */
function rowDiffers(row: SpecRowDef, columns: SpecColumnDef[]): boolean {
  if (columns.length < 2) return false
  const first = formatValue(columns[0].values[row.key])
  return columns.some((column) => formatValue(column.values[row.key]) !== first)
}

/**
 * The core component of the site: label/value specification rows, with a diff
 * mode for comparing products.
 *
 * Two decisions do the work here:
 *
 * 1. Values are monospace with tabular figures, and the unit sits in its own
 *    aligned column. Numbers right-align on a common edge and units all start at
 *    the same x, so a column of "120 W / 65 W / 170 W" scans vertically. This is
 *    the single reason the design uses a mono at all.
 * 2. Differing rows are marked by a surface change AND a marker glyph AND an
 *    accessible label — never by colour alone.
 */
export function SpecTable({
  rows,
  columns,
  diff = false,
  diffOnly = false,
  caption,
  className,
}: SpecTableProps) {
  const comparing = columns.length > 1
  const showDiff = diff && comparing

  const visibleRows = React.useMemo(() => {
    if (!showDiff || !diffOnly) return rows
    return rows.filter((row) => rowDiffers(row, columns))
  }, [rows, columns, showDiff, diffOnly])

  if (columns.length === 0 || visibleRows.length === 0) {
    return (
      <p className={cn('text-sm text-fg-tertiary', className)}>
        {diffOnly ? 'No differences between these products.' : 'No specifications available.'}
      </p>
    )
  }

  return (
    // A comparison of three products cannot fit a 390px viewport. The table
    // scrolls inside its own container rather than widening the page — a
    // horizontally scrolling document breaks every other layout on the screen.
    <div
      className={cn('w-full', comparing && 'overflow-x-auto')}
      // Keyboard users need to be able to scroll it, so it is focusable and labelled.
      tabIndex={comparing ? 0 : undefined}
      role={comparing ? 'region' : undefined}
      aria-label={comparing ? (caption ?? 'Product comparison') : undefined}
    >
      <table
        data-slot="spec-table"
        className={cn('w-full border-collapse text-sm', comparing && 'min-w-lg', className)}
      >
        {caption && <caption className="sr-only">{caption}</caption>}

        {comparing && (
          <thead>
            <tr className="border-b border-border-default">
              <th scope="col" className="w-1/3 py-2 pr-4 text-left font-medium text-fg-tertiary">
                Specification
              </th>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className="py-2 pr-4 text-left font-medium text-fg-primary last:pr-0"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {visibleRows.map((row) => {
            const differs = showDiff && rowDiffers(row, columns)

            return (
              <tr
                key={row.key}
                data-differs={differs || undefined}
                className={cn(
                  'border-b border-border-subtle last:border-b-0',
                  'duration-fast ease-standard transition-colors',
                  differs && 'bg-surface-2',
                )}
              >
                <th
                  scope="row"
                  className="py-2 pr-4 text-left align-baseline font-normal text-fg-tertiary"
                >
                  <span className="inline-flex items-baseline gap-1.5">
                    {differs && (
                      <>
                        {/* Marker, so the diff survives greyscale. */}
                        <span aria-hidden="true" className="text-accent-default">
                          ●
                        </span>
                        <span className="sr-only">Differs:</span>
                      </>
                    )}
                    {row.label}
                  </span>
                </th>

                {columns.map((column) => (
                  <td
                    key={column.id}
                    className="py-2 pr-4 align-baseline text-fg-primary last:pr-0"
                  >
                    <span className="flex items-baseline">
                      <span className="numeric flex-1 text-right" data-numeric>
                        {formatValue(column.values[row.key])}
                      </span>
                      {/* Fixed-width unit column: this is what makes units align. */}
                      <span className="w-12 shrink-0 pl-1 text-left text-fg-tertiary">
                        {row.unit ?? ''}
                      </span>
                    </span>
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
