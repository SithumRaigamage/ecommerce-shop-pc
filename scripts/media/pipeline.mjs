import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

/**
 * The product-image pipeline.
 *
 * Every product photograph on the site goes through here, so that fifty photos
 * taken by fifty different people on fifty different backgrounds end up looking
 * like one catalogue. That consistency is the whole point: a grid of product
 * cards reads as designed when the subjects sit at the same scale on the same
 * ground, and reads as a template with content poured in when they do not.
 */

/** Emitted widths. 400 is a card, 800 a detail view, 1600 a 2x detail view. */
export const WIDTHS = [400, 800, 1600]

/** AVIF first — it is roughly 30% smaller than WebP at the same quality. */
export const FORMATS = ['avif', 'webp']

/**
 * Padding as a fraction of the canvas, per side. A product never touches the
 * edge, so a card can crop or round its container without clipping the subject,
 * and a tall GPU and a square CPU occupy visually comparable area.
 */
export const PADDING = 0.08

/** The LQIP is 20px wide. Big enough to carry colour and mass, small enough to inline. */
export const LQIP_WIDTH = 20

/**
 * Backgrounds, one per theme, matching --surface-2 in each. Only used for source
 * images that have no alpha channel: an opaque photograph shot on white is a
 * white box on a dark page unless it is composited onto the page's own surface.
 *
 * Sources *with* alpha are left transparent and emit a single set, which is
 * strictly better — one asset that is correct in both themes and stays correct
 * if the surface tokens change.
 */
export const THEME_BACKGROUNDS = {
  dark: { r: 32, g: 36, b: 43 },
  light: { r: 244, g: 245, b: 247 },
}

/**
 * Trim uniform border, fit into a square, pad consistently.
 *
 * Trimming first is what makes the padding mean anything: without it, "8% of
 * the canvas" is 8% plus however much empty space the photographer happened to
 * leave, which is different for every source.
 */
async function normalise(input, size, background) {
  const inner = Math.round(size * (1 - PADDING * 2))
  const canvas = { width: size, height: size }

  let image = sharp(input)
  const metadata = await image.metadata()

  // trim() throws when an image is entirely uniform; that is a broken source,
  // not a pipeline failure, so let it surface with a useful message.
  if (metadata.width > 1 && metadata.height > 1) {
    image = image.trim({ threshold: 10 })
  }

  const subject = await image
    .resize(inner, inner, { fit: 'inside', withoutEnlargement: false })
    .toBuffer()

  return sharp({
    create: {
      ...canvas,
      channels: 4,
      background: background ? { ...background, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: subject, gravity: 'centre' }])
    .png()
    .toBuffer()
}

async function encode(buffer, format) {
  const image = sharp(buffer)
  if (format === 'avif') return image.avif({ quality: 55, effort: 6 }).toBuffer()
  return image.webp({ quality: 78, effort: 5 }).toBuffer()
}

/** A 20px WebP, inlined into the manifest as a data URI for blur-up. */
async function lqip(buffer) {
  const data = await sharp(buffer)
    .resize(LQIP_WIDTH, LQIP_WIDTH, { fit: 'inside' })
    .webp({ quality: 40 })
    .toBuffer()
  return `data:image/webp;base64,${data.toString('base64')}`
}

export function assetName(id, theme, width, format) {
  return theme ? `${id}-${theme}-${width}.${format}` : `${id}-${width}.${format}`
}

/**
 * Run one source image through the pipeline.
 *
 * Returns the manifest entry. `themed` records which branch was taken, because
 * the consumer has to know whether to pick an asset by theme or not.
 */
export async function processImage({ id, source, outDir, publicPath }) {
  const input = await readFile(source)

  // isOpaque, not metadata().hasAlpha: an exporter that writes a redundant alpha
  // channel into a fully opaque PNG is common, and treating that as "has
  // transparency" would leave the subject floating on nothing with no
  // background composited behind it. What matters is whether any pixel is
  // actually see-through.
  const { isOpaque } = await sharp(input).stats()
  const themes = isOpaque ? Object.keys(THEME_BACKGROUNDS) : [null]

  await mkdir(outDir, { recursive: true })

  let lqipDataUri = null
  const files = []

  for (const theme of themes) {
    const background = theme ? THEME_BACKGROUNDS[theme] : null

    for (const width of WIDTHS) {
      const canvas = await normalise(input, width, background)

      // The LQIP comes off the largest canvas of the first theme, so it is the
      // same crop and padding as the image it stands in for.
      if (lqipDataUri === null && width === WIDTHS.at(-1)) {
        lqipDataUri = await lqip(canvas)
      }

      for (const format of FORMATS) {
        const name = assetName(id, theme, width, format)
        await writeFile(path.join(outDir, name), await encode(canvas, format))
        files.push(name)
      }
    }
  }

  return {
    entry: {
      base: publicPath,
      widths: WIDTHS,
      formats: FORMATS,
      themed: isOpaque,
      lqip: lqipDataUri,
    },
    files,
  }
}

/** Stable hash of a source file, so the manifest records exactly what was built. */
export async function sourceHash(file) {
  return createHash('sha256')
    .update(await readFile(file))
    .digest('hex')
    .slice(0, 12)
}

export async function cleanDir(dir) {
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
}
