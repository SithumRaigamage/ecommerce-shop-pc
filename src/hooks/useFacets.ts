import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { readFacets, writeFacets, type FacetCodec, type FacetValues } from '@/lib/facets'

/**
 * Binds a facet schema to the URL query string. Returns the parsed values and a
 * setter taking a partial update; unrelated query params are preserved.
 *
 * Filter changes use `replace` so dragging a slider doesn't push a history entry
 * per pixel — back still returns to the previous page rather than the previous
 * slider position.
 */
export function useFacets<S extends Record<string, FacetCodec<unknown>>>(schema: S) {
  const [searchParams, setSearchParams] = useSearchParams()

  const values = useMemo(() => readFacets(schema, searchParams), [schema, searchParams])

  const setFacets = useCallback(
    (updates: Partial<FacetValues<S>>, options?: { replace?: boolean }) => {
      setSearchParams((current) => writeFacets(schema, current, updates), {
        replace: options?.replace ?? true,
      })
    },
    [schema, setSearchParams],
  )

  return [values, setFacets] as const
}
