/**
 * Fails the build if the product catalogue breaks its contract — most importantly
 * if a record is missing a spec field required for its category.
 *
 * Run: `npm run validate:catalogue` (also runs as part of `npm test`).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { validateCatalogue } from '../src/lib/catalogue-schema'
import type { Product } from '../src/types'

const CATALOGUE = resolve(process.cwd(), 'public/assets/json/products.json')

function main(): void {
  let products: Product[]

  try {
    products = JSON.parse(readFileSync(CATALOGUE, 'utf8')) as Product[]
  } catch (error) {
    console.error(`✗ could not read ${CATALOGUE}: ${(error as Error).message}`)
    process.exit(1)
  }

  if (!Array.isArray(products)) {
    console.error('✗ products.json must contain an array')
    process.exit(1)
  }

  const issues = validateCatalogue(products)

  if (issues.length > 0) {
    console.error(`✗ catalogue invalid — ${issues.length} issue(s):`)
    for (const issue of issues) {
      console.error(`  ${issue.id}: ${issue.problem}`)
    }
    process.exit(1)
  }

  const byCategory = products.reduce<Record<string, number>>((acc, product) => {
    acc[product.category] = (acc[product.category] ?? 0) + 1
    return acc
  }, {})

  const summary = Object.entries(byCategory)
    .map(([category, count]) => `${category}=${count}`)
    .join(' ')

  console.log(`✓ catalogue valid — ${products.length} products (${summary})`)
}

main()
