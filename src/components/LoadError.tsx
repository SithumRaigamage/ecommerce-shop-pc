import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LoadErrorProps {
  message: string
  onRetry?: () => void
}

/**
 * Shown when a data fetch rejects. Previously these failures were swallowed and
 * the section simply rendered empty, which is indistinguishable from "no results".
 */
export function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="text-muted-foreground flex flex-col items-center gap-3 py-12 text-center"
    >
      <AlertTriangle className="text-destructive size-8" aria-hidden="true" />
      <p>{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
