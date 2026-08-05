import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Changing this resets the boundary — pass the route key so navigation recovers. */
  resetKey?: string
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Catches render-time errors so one broken route shows a recoverable message
 * instead of unmounting the whole app to a blank page. Async rejections are not
 * caught here — those surface through `useAsync`'s `error` and `ErrorState`.
 *
 * Must be a class: React exposes no hook equivalent of componentDidCatch.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  private readonly handleReset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        role="alert"
        className="text-fg-tertiary flex flex-col items-center gap-3 py-24 text-center"
      >
        <AlertTriangle className="text-danger-fg size-10" aria-hidden="true" />
        <h1 className="text-fg-primary text-2xl font-bold">Something went wrong</h1>
        <p className="max-w-prose">
          This page failed to render. You can try again, or navigate elsewhere.
        </p>
        <Button variant="outline" className="mt-2" onClick={this.handleReset}>
          Try again
        </Button>
      </div>
    )
  }
}
