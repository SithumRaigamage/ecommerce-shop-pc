import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import sharp from 'sharp'
// @ts-expect-error -- plain ESM module, no types; this is a build script.
import { PADDING, WIDTHS, assetName, processImage } from './pipeline.mjs'

/**
 * The pipeline is exercised against generated fixtures rather than a committed
 * photograph. Committing a real product image as a test fixture would mean
 * shipping imagery whose licence is not established, which is the one thing
 * this stage is not allowed to do.
 */

/** An off-centre red square in a large white field, i.e. a badly cropped source. */
async function opaqueSource(): Promise<Buffer> {
  const subject = await sharp({
    create: { width: 200, height: 200, channels: 3, background: { r: 200, g: 40, b: 40 } },
  })
    .png()
    .toBuffer()

  return sharp({
    create: { width: 900, height: 700, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{ input: subject, top: 80, left: 120 }])
    .png()
    .toBuffer()
}

/** The same subject on transparency. */
async function alphaSource(): Promise<Buffer> {
  const subject = await sharp({
    create: { width: 200, height: 200, channels: 4, background: { r: 200, g: 40, b: 40, alpha: 1 } },
  })
    .png()
    .toBuffer()

  return sharp({
    create: { width: 900, height: 700, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: subject, top: 80, left: 120 }])
    .png()
    .toBuffer()
}

let dir: string
let outDir: string

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'media-pipeline-'))
  outDir = path.join(dir, 'out')
  await writeFile(path.join(dir, 'opaque.png'), await opaqueSource())
  await writeFile(path.join(dir, 'alpha.png'), await alphaSource())
})

afterAll(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('media pipeline', () => {
  it('normalises an opaque source to a square canvas at every width', async () => {
    const { entry } = await processImage({
      id: 'opaque',
      source: path.join(dir, 'opaque.png'),
      outDir,
      publicPath: '/assets/products/build',
    })

    expect(entry.widths).toEqual(WIDTHS)

    for (const width of WIDTHS) {
      const file = path.join(outDir, assetName('opaque', 'dark', width, 'webp'))
      const meta = await sharp(await readFile(file)).metadata()
      expect(meta.width, `width ${width}`).toBe(width)
      expect(meta.height, `height ${width}`).toBe(width)
    }
  })

  it('trims the source and applies the same padding regardless of the original crop', async () => {
    await processImage({
      id: 'opaque',
      source: path.join(dir, 'opaque.png'),
      outDir,
      publicPath: '/x',
    })

    // The subject is square, so after trimming it should fill the inner box
    // exactly. That is what makes a 900x700 source and a 400x400 source land at
    // the same visual scale on a card.
    const size = 800
    const file = path.join(outDir, assetName('opaque', 'dark', size, 'webp'))
    const { info, data } = await sharp(await readFile(file))
      .raw()
      .toBuffer({ resolveWithObject: true })

    const at = (x: number, y: number) => {
      const i = (y * info.width + x) * info.channels
      return [data[i], data[i + 1], data[i + 2]]
    }

    const pad = Math.round(size * PADDING)
    const [r] = at(size / 2, size / 2)
    expect(r, 'the subject occupies the centre').toBeGreaterThan(150)

    const [edgeR, edgeG, edgeB] = at(Math.round(pad / 2), Math.round(pad / 2))
    // The corner is the theme background, not the subject and not source white.
    expect(edgeR).toBeLessThan(60)
    expect(edgeG).toBeLessThan(60)
    expect(edgeB).toBeLessThan(70)
  })

  it('emits one set per theme for an opaque source', async () => {
    const { entry, files } = await processImage({
      id: 'opaque',
      source: path.join(dir, 'opaque.png'),
      outDir,
      publicPath: '/x',
    })

    expect(entry.themed).toBe(true)
    // 2 themes x 3 widths x 2 formats.
    expect(files).toHaveLength(12)
    expect(files).toContain('opaque-light-400.avif')
    expect(files).toContain('opaque-dark-400.avif')
  })

  it('keeps alpha and emits a single set, correct in both themes', async () => {
    const { entry, files } = await processImage({
      id: 'alpha',
      source: path.join(dir, 'alpha.png'),
      outDir,
      publicPath: '/x',
    })

    expect(entry.themed).toBe(false)
    expect(files).toHaveLength(6)
    expect(files).toContain('alpha-400.avif')

    const meta = await sharp(await readFile(path.join(outDir, 'alpha-800.webp'))).metadata()
    expect(meta.hasAlpha, 'transparency must survive the pipeline').toBe(true)
  })

  it('emits AVIF smaller than the equivalent WebP', async () => {
    await processImage({ id: 'opaque', source: path.join(dir, 'opaque.png'), outDir, publicPath: '/x' })

    const avif = await readFile(path.join(outDir, 'opaque-dark-800.avif'))
    const webp = await readFile(path.join(outDir, 'opaque-dark-800.webp'))
    // The whole reason AVIF is listed first in the <picture>.
    expect(avif.byteLength).toBeLessThan(webp.byteLength)
  })

  it('produces an inlinable LQIP that carries the subject colour', async () => {
    const { entry } = await processImage({
      id: 'opaque',
      source: path.join(dir, 'opaque.png'),
      outDir,
      publicPath: '/x',
    })

    expect(entry.lqip).toMatch(/^data:image\/webp;base64,/)
    // Small enough that inlining it in the manifest is cheaper than a request.
    expect(entry.lqip!.length).toBeLessThan(2000)

    const decoded = Buffer.from(entry.lqip!.split(',')[1], 'base64')
    const meta = await sharp(decoded).metadata()
    expect(meta.width).toBeLessThanOrEqual(20)
  })
})
