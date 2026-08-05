import type { Product } from '@/types'

/**
 * Required spec keys per category. This is the contract `scripts/validate-catalogue.ts`
 * enforces at build/test time; adding a category means adding an entry here.
 */
export const CATEGORY_SPEC_FIELDS: Record<string, readonly string[]> = {
  processor: ['socket', 'cores', 'threads', 'tdp'],
  graphics: ['vram_gb', 'tdp', 'length_mm'],
  motherboards: ['socket', 'chipset', 'form_factor', 'ram_slots'],
  memory: ['type', 'speed', 'cas', 'capacity'],
  power: ['wattage', 'efficiency', 'modular'],
  cases: ['max_gpu_mm', 'max_cooler_mm', 'form_factors'],
  storage: ['interface', 'capacity', 'read_mbs'],
  monitors: ['size', 'resolution', 'refresh', 'panel'],
}

/** Fields every product must carry regardless of category. `image` may be null. */
const REQUIRED_FIELDS = ['id', 'title', 'brand', 'mpn', 'price', 'category'] as const

export interface CatalogueIssue {
  id: string
  problem: string
}

function isPresent(value: unknown): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (Array.isArray(value)) return value.length > 0
  return true
}

/**
 * Returns every problem found. An empty array means the catalogue is valid.
 * Pure and dependency-free so both the CLI and the unit tests can call it.
 */
export function validateCatalogue(products: Product[]): CatalogueIssue[] {
  const issues: CatalogueIssue[] = []
  const seenIds = new Set<string>()

  if (products.length === 0) {
    issues.push({ id: '(catalogue)', problem: 'catalogue is empty' })
  }

  for (const [index, product] of products.entries()) {
    const id = product?.id ?? `(index ${index})`

    for (const field of REQUIRED_FIELDS) {
      if (!isPresent(product[field])) {
        issues.push({ id, problem: `missing required field "${field}"` })
      }
    }

    if (typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price <= 0) {
      issues.push({ id, problem: `price must be a positive number, got ${JSON.stringify(product.price)}` })
    }

    if (seenIds.has(product.id)) {
      issues.push({ id, problem: 'duplicate id' })
    }
    seenIds.add(product.id)

    const required = CATEGORY_SPEC_FIELDS[product.category]
    if (!required) {
      issues.push({ id, problem: `unknown category "${product.category}"` })
      continue
    }

    if (!product.specs || typeof product.specs !== 'object') {
      issues.push({ id, problem: `missing specs object for category "${product.category}"` })
      continue
    }

    for (const key of required) {
      if (!isPresent(product.specs[key])) {
        issues.push({ id, problem: `missing spec "${key}" required for category "${product.category}"` })
      }
    }
  }

  return issues
}
