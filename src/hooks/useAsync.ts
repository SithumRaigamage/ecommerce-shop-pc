import { useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | undefined
  loading: boolean
  error: Error | undefined
}

/**
 * Replaces the `service.getX().subscribe(...)` calls the Angular components made
 * in `ngOnInit`. Re-runs whenever `deps` change and drops results from stale runs.
 */
export function useAsync<T>(factory: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: undefined,
    loading: true,
    error: undefined,
  })

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
  }, deps)

  return state
}
