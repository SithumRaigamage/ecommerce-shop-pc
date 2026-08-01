/**
 * Typed URL-query serialisation for catalogue facets.
 *
 * Facets live in the URL so they survive navigation, back/forward and sharing.
 * Adding a facet means adding one entry to `CATALOGUE_FACETS` — no consumer of
 * `useFacets` has to change.
 */

export interface FacetCodec<T> {
  /** Query-string key. */
  readonly param: string
  /** Value used when the param is absent or unparseable. */
  readonly fallback: T
  parse(raw: string | null): T
  /** Return null to omit the param entirely (keeps default state out of the URL). */
  serialize(value: T): string | null
}

export function stringFacet(param: string, fallback = ''): FacetCodec<string> {
  return {
    param,
    fallback,
    parse: (raw) => raw ?? fallback,
    serialize: (value) => (value && value !== fallback ? value : null),
  }
}

export function numberFacet(param: string, fallback: number | null = null): FacetCodec<number | null> {
  return {
    param,
    fallback,
    parse: (raw) => {
      if (raw === null || raw.trim() === '') return fallback
      const parsed = Number(raw)
      return Number.isFinite(parsed) ? parsed : fallback
    },
    serialize: (value) => (value === null || value === fallback ? null : String(value)),
  }
}

/** Repeatable facet, e.g. `?brand=ASUS&brand=MSI` — ready for brand/socket filters. */
export function stringListFacet(param: string): FacetCodec<string[]> {
  return {
    param,
    fallback: [],
    parse: (raw) => (raw ? raw.split(',').filter(Boolean) : []),
    serialize: (value) => (value.length > 0 ? value.join(',') : null),
  }
}

export type FacetValues<S extends Record<string, FacetCodec<unknown>>> = {
  [K in keyof S]: S[K] extends FacetCodec<infer T> ? T : never
}

/**
 * The catalogue's facets.
 *
 * Spec facets (`socket`…`panel`) are declared once here and *rendered* only for
 * the categories that define them — see `SPEC_FACETS` in `lib/catalogue.ts`.
 * `compare` lives in the URL too, so a comparison is a shareable link rather
 * than throwaway local state.
 */
export const CATALOGUE_FACETS = {
  category: stringFacet('category'),
  maxPrice: numberFacet('maxPrice'),
  brand: stringListFacet('brand'),

  // Category-specific spec facets.
  socket: stringListFacet('socket'),
  chipset: stringListFacet('chipset'),
  form_factor: stringListFacet('form_factor'),
  type: stringListFacet('type'),
  efficiency: stringListFacet('efficiency'),
  modular: stringListFacet('modular'),
  interface: stringListFacet('interface'),
  panel: stringListFacet('panel'),
  resolution: stringListFacet('resolution'),

  // View state. In the URL so a shared link reproduces what the sender saw.
  sort: stringFacet('sort', 'relevance'),
  density: stringFacet('density', 'comfortable'),
  compare: stringListFacet('compare'),
} as const

export type CatalogueFacetValues = FacetValues<typeof CATALOGUE_FACETS>

/** Facet keys that actually narrow results, in the order the rail shows them. */
export const FILTER_FACET_KEYS = [
  'category',
  'brand',
  'socket',
  'chipset',
  'form_factor',
  'type',
  'efficiency',
  'modular',
  'interface',
  'panel',
  'resolution',
  'maxPrice',
] as const

export function readFacets<S extends Record<string, FacetCodec<unknown>>>(
  schema: S,
  params: URLSearchParams,
): FacetValues<S> {
  const result = {} as FacetValues<S>
  for (const key of Object.keys(schema) as (keyof S)[]) {
    const codec = schema[key]
    result[key] = codec.parse(params.get(codec.param)) as FacetValues<S>[keyof S]
  }
  return result
}

/**
 * Applies a partial facet update onto existing params, dropping params whose
 * value serialises to null so defaults never litter the URL. Any query key not
 * owned by the schema (utm tags, etc.) is preserved.
 */
export function writeFacets<S extends Record<string, FacetCodec<unknown>>>(
  schema: S,
  params: URLSearchParams,
  updates: Partial<FacetValues<S>>,
): URLSearchParams {
  const next = new URLSearchParams(params)

  for (const key of Object.keys(updates) as (keyof S)[]) {
    const codec = schema[key]
    if (!codec) continue
    const serialized = codec.serialize(updates[key] as never)
    if (serialized === null) {
      next.delete(codec.param)
    } else {
      next.set(codec.param, serialized)
    }
  }

  return next
}
