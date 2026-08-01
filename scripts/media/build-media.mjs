import { access, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cleanDir, processImage, sourceHash } from './pipeline.mjs'

/**
 * Builds every product image from `media/source/` into `public/assets/products/`
 * and writes the manifest the app reads.
 *
 * The ledger is load-bearing, not paperwork. An image with no entry in
 * `media/sources.json` is refused, and so is an entry with no licence or no
 * source URL. The rule this enforces — never ship imagery whose provenance you
 * cannot state — is the one rule in this stage that has consequences outside
 * the repository, so it is checked by the build rather than by remembering.
 *
 *   npm run media          build
 *   npm run media -- --check   verify the manifest matches the sources on disk
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SOURCE_DIR = path.join(ROOT, 'media/source')
const LEDGER = path.join(ROOT, 'media/sources.json')
const OUT_DIR = path.join(ROOT, 'public/assets/products/build')
const MANIFEST = path.join(ROOT, 'src/lib/media-manifest.json')
const PUBLIC_BASE = '/assets/products/build'

const REQUIRED_LEDGER_FIELDS = ['source', 'licence', 'retrieved']

async function exists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

async function readLedger() {
  if (!(await exists(LEDGER))) return {}
  return JSON.parse(await readFile(LEDGER, 'utf8'))
}

async function listSources() {
  if (!(await exists(SOURCE_DIR))) return []
  const entries = await readdir(SOURCE_DIR)
  return entries
    .filter((name) => /\.(png|jpe?g|webp|tiff?)$/i.test(name))
    .map((name) => ({ id: path.parse(name).name, file: path.join(SOURCE_DIR, name) }))
}

/**
 * Refuse anything the ledger cannot account for. A retailer's CDN is the
 * specific thing this catches: it is trivially easy to drop a file in and
 * forget where it came from, and impossible to establish afterwards.
 */
function auditProvenance(sources, ledger) {
  const problems = []

  for (const { id } of sources) {
    const record = ledger[id]
    if (!record) {
      problems.push(`${id}: no entry in media/sources.json`)
      continue
    }
    for (const field of REQUIRED_LEDGER_FIELDS) {
      if (!record[field]) problems.push(`${id}: ledger entry is missing "${field}"`)
    }
    if (record.source && /nanotek|daraz|amazon\.|ebay\./i.test(record.source)) {
      problems.push(`${id}: source looks like a retailer listing, which is not a permitted source`)
    }
  }

  const orphaned = Object.keys(ledger).filter((id) => !sources.some((s) => s.id === id))
  for (const id of orphaned) problems.push(`${id}: ledger entry with no file in media/source/`)

  return problems
}

async function main() {
  const check = process.argv.includes('--check')
  const [sources, ledger] = await Promise.all([listSources(), readLedger()])

  const problems = auditProvenance(sources, ledger)
  if (problems.length > 0) {
    console.error('Provenance audit failed:\n' + problems.map((p) => `  - ${p}`).join('\n'))
    process.exit(1)
  }

  if (check) {
    const manifest = (await exists(MANIFEST))
      ? JSON.parse(await readFile(MANIFEST, 'utf8'))
      : { products: {} }
    const stale = []
    for (const { id, file } of sources) {
      const entry = manifest.products[id]
      if (!entry) stale.push(`${id}: built asset missing from the manifest`)
      else if (entry.hash !== (await sourceHash(file))) stale.push(`${id}: source changed since build`)
    }
    const removed = Object.keys(manifest.products).filter((id) => !sources.some((s) => s.id === id))
    for (const id of removed) stale.push(`${id}: in the manifest with no source`)

    if (stale.length > 0) {
      console.error('Manifest is out of date:\n' + stale.map((p) => `  - ${p}`).join('\n'))
      console.error('\nRun: npm run media')
      process.exit(1)
    }
    console.log(`media: manifest is current (${sources.length} product images)`)
    return
  }

  await cleanDir(OUT_DIR)

  const products = {}
  let fileCount = 0

  for (const { id, file } of sources) {
    const { entry, files } = await processImage({
      id,
      source: file,
      outDir: OUT_DIR,
      publicPath: PUBLIC_BASE,
    })
    products[id] = { ...entry, hash: await sourceHash(file), licence: ledger[id].licence }
    fileCount += files.length
    console.log(`  ${id}: ${files.length} files${entry.themed ? ' (per-theme)' : ' (alpha)'}`)
  }

  await writeFile(
    MANIFEST,
    JSON.stringify(
      {
        // Generated. Every product missing from here renders the designed
        // placeholder, which is a supported state and not a failure.
        generated: 'scripts/media/build-media.mjs',
        products,
      },
      null,
      2,
    ) + '\n',
  )

  console.log(
    sources.length === 0
      ? 'media: no sources yet — every product renders the designed placeholder'
      : `media: built ${fileCount} files for ${sources.length} products`,
  )
}

await main()
