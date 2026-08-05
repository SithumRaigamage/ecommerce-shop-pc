import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Layout primitives.
 *
 * Pages were each declaring their own `grid-cols-*` / `space-y-*` / `flex gap-*`,
 * so spacing drifted between them and no rhythm was shared. These three cover
 * every arrangement in the app: vertical flow (Stack), horizontal wrapping
 * flow (Cluster), and a 12-column grid (Grid + GridItem).
 *
 * Gaps are token names, never numbers — see DESIGN.md §4.
 */

const GAP = {
  none: 'gap-0',
  tight: 'gap-stack-tight', // 8px
  default: 'gap-stack', // 12px
  card: 'gap-card-padding', // 16px
  gutter: 'gap-gutter', // 24px
  section: 'gap-section', // 64px
} as const

export type Gap = keyof typeof GAP

const ALIGN = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const

const JUSTIFY = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const

interface StackProps extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'> {
  as?: ElementType
  gap?: Gap
  align?: keyof typeof ALIGN
  className?: string
  children: ReactNode
}

/** Vertical flow. The default arrangement for almost everything. */
export function Stack({
  as: Tag = 'div',
  gap = 'default',
  align,
  className,
  children,
  ...rest
}: StackProps) {
  return (
    <Tag className={cn('flex flex-col', GAP[gap], align && ALIGN[align], className)} {...rest}>
      {children}
    </Tag>
  )
}

interface ClusterProps extends StackProps {
  justify?: keyof typeof JUSTIFY
  wrap?: boolean
}

/** Horizontal flow that wraps. Toolbars, chip rows, button groups. */
export function Cluster({
  as: Tag = 'div',
  gap = 'tight',
  align = 'center',
  justify,
  wrap = true,
  className,
  children,
  ...rest
}: ClusterProps) {
  return (
    <Tag
      className={cn(
        'flex',
        wrap && 'flex-wrap',
        GAP[gap],
        ALIGN[align],
        justify && JUSTIFY[justify],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/* ------------------------------------------------------------------ grid */

/**
 * Column counts are literal class strings because Tailwind scans source text —
 * a computed `grid-cols-${n}` would never be emitted.
 */
const COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
} as const
const COLS_SM = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' } as const
const COLS_LG = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 12: 'lg:grid-cols-12' } as const
const COLS_XL = { 2: 'xl:grid-cols-2', 3: 'xl:grid-cols-3', 4: 'xl:grid-cols-4', 5: 'xl:grid-cols-5', 12: 'xl:grid-cols-12' } as const
/** The point of designing for 2xl: more results per row, not wider gutters. */
const COLS_2XL = { 3: '2xl:grid-cols-3', 4: '2xl:grid-cols-4', 5: '2xl:grid-cols-5', 6: '2xl:grid-cols-6', 12: '2xl:grid-cols-12' } as const

type Cols = keyof typeof COLS

interface GridProps {
  cols?: Cols
  sm?: keyof typeof COLS_SM
  lg?: keyof typeof COLS_LG
  xl?: keyof typeof COLS_XL
  xxl?: keyof typeof COLS_2XL
  gap?: Gap
  className?: string
  children: ReactNode
}

export function Grid({ cols = 1, sm, lg, xl, xxl, gap = 'gutter', className, children }: GridProps) {
  return (
    <div
      className={cn(
        'grid',
        COLS[cols],
        sm && COLS_SM[sm],
        lg && COLS_LG[lg],
        xl && COLS_XL[xl],
        xxl && COLS_2XL[xxl],
        GAP[gap],
        className,
      )}
    >
      {children}
    </div>
  )
}

const SPAN = {
  1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
  5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
  9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
} as const
const SPAN_LG = {
  3: 'lg:col-span-3', 4: 'lg:col-span-4', 5: 'lg:col-span-5',
  7: 'lg:col-span-7', 8: 'lg:col-span-8', 9: 'lg:col-span-9', 12: 'lg:col-span-12',
} as const
const SPAN_XL = {
  2: 'xl:col-span-2', 3: 'xl:col-span-3', 9: 'xl:col-span-9', 10: 'xl:col-span-10', 12: 'xl:col-span-12',
} as const
const SPAN_2XL = {
  2: '2xl:col-span-2', 3: '2xl:col-span-3', 9: '2xl:col-span-9', 10: '2xl:col-span-10', 12: '2xl:col-span-12',
} as const

interface GridItemProps {
  span?: keyof typeof SPAN
  lg?: keyof typeof SPAN_LG
  xl?: keyof typeof SPAN_XL
  xxl?: keyof typeof SPAN_2XL
  className?: string
  children: ReactNode
}

export function GridItem({ span = 12, lg, xl, xxl, className, children }: GridItemProps) {
  return (
    <div className={cn(SPAN[span], lg && SPAN_LG[lg], xl && SPAN_XL[xl], xxl && SPAN_2XL[xxl], className)}>
      {children}
    </div>
  )
}

/* -------------------------------------------------------------- container */

const CONTAINER = {
  form: 'max-w-form',
  reading: 'max-w-reading',
  content: 'max-w-content',
  catalogue: 'max-w-catalogue',
  full: 'max-w-none',
} as const

/** Width is chosen by what the page holds, not by one global wrapper. */
export function Container({
  size = 'content',
  className,
  children,
}: {
  size?: keyof typeof CONTAINER
  className?: string
  children: ReactNode
}) {
  return <div className={cn('mx-auto w-full', CONTAINER[size], className)}>{children}</div>
}
