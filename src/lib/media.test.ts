import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { SIZES, builtAssetIds, mediaFor } from './media'
import type { Product } from '@/types'

const root = process.cwd()
const ledgerPath = resolve(root, 'media/sources.json')
const ledger: Record<string, { source?: string; licence?: string; retrieved?: string }> =
  existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : {}

// Read from disk rather than through the api layer: this asserts what ships in
// the repository, not what a mocked fetch returns.
const products: Product[] = JSON.parse(
  readFileSync(resolve(root, 'public/assets/json/products.json'), 'utf8'),
)

describe('media manifest', () => {
  it('has a provenance record for every built asset', () => {
    // The rule with consequences outside this repository: nothing ships whose
    // origin and licence cannot be stated. `npm run media` refuses to build
    // without it; this fails the suite if the manifest is edited by hand.
    const undocumented = builtAssetIds().filter((id) => {
      const record = ledger[id]
      return !record?.source || !record?.licence || !record?.retrieved
    })
    expect(undocumented).toEqual([])
  })

  it('never records a retailer listing as a source', () => {
    // The catalogue in this repo was originally scraped from nanotek.lk, and the
    // image URLs it captured were retailer CDN hotlinks that later 404'd. That
    // is the exact failure this guards against returning.
    const retailers = Object.entries(ledger).filter(([, record]) =>
      /nanotek|daraz|amazon\.|ebay\.|aliexpress/i.test(record.source ?? ''),
    )
    expect(retailers.map(([id]) => id)).toEqual([])
  })

  it('points every manifest entry at files that exist', () => {
    const missing: string[] = []

    for (const id of builtAssetIds()) {
      const entry = mediaFor(id)!
      const themes = entry.themed ? ['light', 'dark'] : [null]
      for (const theme of themes) {
        for (const width of entry.widths) {
          for (const format of entry.formats) {
            const suffix = theme ? `-${theme}` : ''
            const file = `public${entry.base}/${id}${suffix}-${width}.${format}`
            if (!existsSync(resolve(root, file))) missing.push(file)
          }
        }
      }
    }

    expect(missing).toEqual([])
  })

  it('leaves no built file that the manifest does not claim', () => {
    // A stale file is a deleted product's imagery still being served, or a
    // rename that half-happened. Either way the build directory should be
    // exactly what the manifest describes.
    const buildDir = resolve(root, 'public/assets/products/build')
    if (!existsSync(buildDir)) {
      expect(builtAssetIds()).toEqual([])
      return
    }

    const claimed = new Set<string>()
    for (const id of builtAssetIds()) {
      const entry = mediaFor(id)!
      const themes = entry.themed ? ['light', 'dark'] : [null]
      for (const theme of themes) {
        for (const width of entry.widths) {
          for (const format of entry.formats) {
            claimed.add(`${id}${theme ? `-${theme}` : ''}-${width}.${format}`)
          }
        }
      }
    }

    const orphans = readdirSync(buildDir).filter((file) => !claimed.has(file))
    expect(orphans).toEqual([])
  })
})

describe('catalogue imagery', () => {
  it('resolves imagery by product id, never by a stored path or URL', () => {
    // Guards the whole class of bug the previous catalogue had: 287 of 299
    // images were third-party URLs, and every one of them eventually 404'd.
    const withPaths = products.filter((product) =>
      Object.entries(product as unknown as Record<string, unknown>).some(
        ([key, value]) =>
          typeof value === 'string' &&
          key !== 'description' &&
          /^https?:\/\/|\.(png|jpe?g|webp|avif)$/i.test(value),
      ),
    )
    expect(withPaths.map((p) => p.id)).toEqual([])
  })

  it('renders the designed placeholder for every product without built imagery', () => {
    const built = new Set(builtAssetIds())
    const unbuilt = products.filter((product) => !built.has(product.id))

    // Not an assertion that this stays empty — it is the catalogue's normal
    // state. What must hold is that every one of them can render a placeholder
    // that names something, which needs an mpn and a known category.
    for (const product of unbuilt) {
      expect(product.mpn, `${product.id} needs an mpn for its placeholder`).toBeTruthy()
      expect(product.category, `${product.id} needs a category for its glyph`).toBeTruthy()
    }
  })

  it('declares a sizes value for every layout that renders imagery', () => {
    for (const [layout, value] of Object.entries(SIZES)) {
      expect(value, layout).toMatch(/\d/)
      // A bare percentage with no media query means one candidate for every
      // breakpoint, which defeats the point of a srcset.
      if (layout !== 'thumbnail' && layout !== 'cartLine') {
        expect(value, layout).toContain('min-width')
      }
    }
  })
})

describe('no third-party imagery', () => {
  const sourceFiles = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const full = `${dir}/${entry}`
      if (statSync(full).isDirectory()) return sourceFiles(full)
      return /\.(tsx?|json)$/.test(entry) ? [full] : []
    })

  /**
   * Stage 5 removed the catalogue's hotlinks but scoped its guard to the
   * product grid, so eight more survived: seven Unsplash URLs and one to
   * www.nanotek.lk — a competitor — on the home carousel, readable by anyone
   * who opened DevTools. This checks the whole source tree instead.
   */
  it('hotlinks no remote image from anywhere in the source or the fixtures', () => {
    const offenders: string[] = []
    const roots = [resolve(root, 'src'), resolve(root, 'public/assets/json')]

    for (const dir of roots) {
      for (const file of sourceFiles(dir)) {
        if (/\.test\.tsx?$/.test(file) || file.endsWith('media-manifest.json')) continue
        const source = readFileSync(file, 'utf8')
        for (const match of source.matchAll(/https?:\/\/[^\s"'`)]+/g)) {
          if (/\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(match[0]) || /unsplash|cdn\./i.test(match[0])) {
            offenders.push(`${file.replace(`${root}/`, '')}: ${match[0].slice(0, 60)}`)
          }
        }
      }
    }

    expect(offenders).toEqual([])
  })

  it('references no competitor domain anywhere', () => {
    const offenders: string[] = []
    for (const dir of [resolve(root, 'src'), resolve(root, 'public/assets/json')]) {
      for (const file of sourceFiles(dir)) {
        if (/\.test\.tsx?$/.test(file)) continue
        if (/nanotek|chama/i.test(readFileSync(file, 'utf8'))) {
          offenders.push(file.replace(`${root}/`, ''))
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
