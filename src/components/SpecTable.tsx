import * as React from 'react'
import { cn } from '@/lib/utils'
import { bestIndices, type BetterDirection } from '@/lib/catalogue'

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
  /**
   * Which direction wins per row key. Rows absent from the map are never marked
   * — see BETTER_DIRECTION for why guessing is worse than staying silent.
   */
  betterDirection?: Record<string, BetterDirection>
  /**
   * Replay the staggered resolve whenever this changes. Pass the identity of the
   * compared set; the animation is the point at which a comparison becomes
   * readable, so it should re-run when the set does — and never on a re-render
   * that changed nothing.
   */
  revealKey?: string
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
 * Three decisions do the work:
 *
 * 1. Values are monospace with tabular figures, and the unit sits in its own
 *    aligned column, so a column of "120 W / 65 W / 170 W" scans vertically.
 * 2. Differing rows are marked by a surface change AND a marker glyph AND an
 *    accessible label — never by colour alone.
 * 3. With `revealKey`, rows resolve in a fast stagger: everything arrives at
 *    full contrast, then agreeing rows recede to muted while differing rows
 *    stay bright and the better value is marked. The motion is only ordering
 *    the reading; the information is what is worth remembering.
 */
export function SpecTable({
  rows,
  columns,
  diff = false,
  diffOnly = false,
  betterDirection,
  revealKey,
  caption,
  className,
}: SpecTableProps) {
  const comparing = columns.length > 1
  const showDiff = diff && comparing
  const animate = revealKey !== undefined && comparing

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

        {/* Keyed on revealKey so a new comparison remounts the rows and the
            stagger replays. Without the key, CSS animations do not re-run. */}
        <tbody key={revealKey}>
          {visibleRows.map((row, index) => {
            const differs = showDiff && rowDiffers(row, columns)
            const direction = betterDirection?.[row.key]
            const winners = differs
              ? new Set(
                  bestIndices(
                    columns.map((column) => column.values[row.key]),
                    direction,
                  ).map((i) => columns[i].id),
                )
              : new Set<string>()

            return (
              <tr
                key={row.key}
                data-differs={differs || undefined}
                style={
                  animate
                    ? ({ '--row-index': index } as React.CSSProperties)
                    : undefined
                }
                className={cn(
                  'border-b border-border-subtle last:border-b-0',
                  'duration-fast ease-standard transition-colors',
                  // The settled state is a class, not an animation fill: the
                  // table has to read correctly with motion off, on a re-render
                  // after the animation is gone, and in a single-column table.
                  // diff-mute animates to exactly this value, so the handoff at
                  // the end of the keyframe is invisible.
                  differs ? 'bg-surface-2' : 'text-fg-tertiary',
                  // Both variants rise and fade in; only the agreeing rows also
                  // settle from full contrast down to muted.
                  animate && (differs ? 'animate-diff-row' : 'animate-diff-mute'),
                  animate && 'motion-stagger',
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

                {columns.map((column) => {
                  const isWinner = winners.has(column.id)
                  return (
                    <td
                      key={column.id}
                      data-winner={isWinner || undefined}
                      className={cn(
                        'py-2 pr-4 align-baseline last:pr-0',
                        differs ? 'text-fg-primary' : 'text-inherit',
                      )}
                    >
                      <span className="flex items-baseline">
                        <span
                          className={cn('numeric flex-1 text-right', isWinner && 'font-semibold')}
                          data-numeric
                        >
                          {isWinner && (
                            // Weight plus a glyph, never colour: accent is
                            // reserved for affordances and status hues are not
                            // used for emphasis. The caret states which way
                            // "better" ran for this spec. It fades in one beat
                            // behind its row — the verdict follows the values.
                            <span
                              aria-hidden="true"
                              className={cn(
                                'mr-1 text-xs text-fg-tertiary',
                                animate && 'animate-fade-in motion-stagger-late',
                              )}
                            >
                              {direction === 'lower' ? '▼' : '▲'}
                            </span>
                          )}
                          {formatValue(column.values[row.key])}
                        </span>
                        {/* Fixed-width unit column: this is what makes units align. */}
                        <span className="w-12 shrink-0 pl-1 text-left text-fg-tertiary">
                          {row.unit ?? ''}
                        </span>
                      </span>
                      {isWinner && (
                        <span className="sr-only">
                          Best value for {row.label} among the compared products
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
