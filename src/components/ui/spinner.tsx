import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * The single loading affordance. Every component's `loading` state renders this
 * rather than inventing its own, so "busy" looks the same everywhere.
 *
 * `animate-spin` is the only place motion is not token-driven — it is a
 * continuous indicator rather than a transition, and it is already suppressed
 * by the global prefers-reduced-motion clamp in index.css.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      role="status"
      aria-label="Loading"
      className={cn('size-4 shrink-0 animate-spin', className)}
    />
  )
}
