import { useCallback, useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | undefined
  loading: boolean
  error: Error | undefined
}

export interface AsyncResult<T> extends AsyncState<T> {
  /** Re-runs the factory; use to back a "Try again" control. */
  retry: () => void
}

/**
 * Replaces the `service.getX().subscribe(...)` calls the Angular components made
 * in `ngOnInit`. Re-runs whenever `deps` change and drops results from stale runs.
 *
 * Callers are expected to handle `error` — a failed fetch otherwise renders an
 * empty section with no explanation.
 */
export function useAsync<T>(factory: () => Promise<T>, deps: unknown[]): AsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: undefined,
    loading: true,
    error: undefined,
  })
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, loading: true, error: undefined }))

    factory()
      .then((data) => {
        if (active) setState({ data, loading: false, error: undefined })
      })
      .catch((error: Error) => {
        if (active) setState({ data: undefined, loading: false, error })
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  return { ...state, retry }
}
