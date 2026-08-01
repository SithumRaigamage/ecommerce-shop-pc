# Media sources

Provenance for every image this site serves. One row per asset, recording where
it came from and under what terms.

The rule this document exists to enforce: **nothing ships whose origin and
licence cannot be stated.** It is the only rule in the project with consequences
outside the repository, so it is checked mechanically rather than remembered —
`npm run media` refuses to build an asset with no ledger entry, and
`src/lib/media.test.ts` fails the suite if the manifest is edited by hand.

---

## Current state

**No product photography is in the repository.** All 48 products render the
designed placeholder (`src/components/ProductPlaceholder.tsx`): the category
glyph on `--surface-2` with the manufacturer part number set in mono.

| | |
|---|---|
| Products in the catalogue | 48 |
| With cleared, built imagery | 0 |
| Rendering the designed placeholder | 48 |
| Assets in `media/sources.json` | 0 |

This is a supported state, not a broken one. The placeholder is designed to be
seen: it shares the product card's geometry exactly, so a grid that is half
photographed and half not still reads as one grid.

### What was found in the repository

Two things worth recording, because both are the failure mode this stage exists
to prevent.

- **`Web_Scraper/scraper.py` targets `https://www.nanotek.lk/category/`** and
  captures each listing's `<img src>` into the catalogue's `image` field. Those
  were retailer CDN hotlinks. 287 of 299 of them were already dead by the time
  the React migration audited them. The `image` field has since been removed
  from the `Product` type entirely — imagery now resolves from the media
  manifest by product id, so the catalogue has no field capable of pointing at
  another company's server.
- **13 PNGs sit in `public/assets/products/`** (`amd_ryzen_7_9800x3d.png`,
  `asus_rog_rtx_5090.png`, and so on — all 600×600). They were carried over from
  the Angular app in commit `f2d06b9`, no product references them, and **their
  origin cannot be established from the repository history.** Given what the
  scraper did, the likeliest source is the retailer listing pages. They are
  therefore *not* used, and they must not be adopted as product imagery without
  someone confirming where they came from. They have been left in place rather
  than deleted — that call is the repository owner's, not the pipeline's.

---

## Sources, in order of preference

### 1. Manufacturer press and media kits

The right source: high resolution, shot on seamless, and usually explicitly
offered for partner and reseller use.

**Status: terms not yet verified.** Automated retrieval of these pages was
blocked (`intel.com` and `msi.com` return HTTP 403 to non-browser clients,
`amd.com` timed out), so nothing has been read first-hand. **Nothing below is a
statement of what any brand permits** — it is a list of where to go and check,
and each needs a human to read the terms and record the answer.

| Brand | Products | Where to check |
|---|---|---|
| ASUS | 5 | `press.asus.com` |
| MSI | 5 | `msi.com` press room / brand-and-trademark page |
| Corsair | 4 | `corsair.com` newsroom / partner portal |
| AMD | 3 | `amd.com/en/newsroom`, plus the trademark and brand guidelines page |
| Intel | 3 | `intel.com/newsroom` press kits |
| Gigabyte | 3 | `gigabyte.com` news / press |
| Samsung | 3 | `news.samsung.com` media library |
| Kingston, TEAMGROUP | 2 each | brand newsroom |
| Cooler Master | 2 | brand newsroom |
| ZOTAC, Sapphire, PowerColor, ASRock, G.SKILL, Seasonic, be quiet!, Lian Li, NZXT, Fractal Design, Antec, Western Digital, Crucial, Seagate, LG, Dell | 1 each | brand newsroom |

When terms are confirmed for a brand, record them here with the date and the URL
they were read from, then ingest the assets (below).

### 2. Own photography

Shot on a consistent seamless background. The pipeline handles the rest — it
trims, centres and pads, so sources do not need to be identically cropped, only
identically lit.

Record as `licence: "own-work"` with the shoot date.

### 3. The designed placeholder

For any product with neither. `src/components/ProductPlaceholder.tsx`.

It is a component rather than a generated raster on purpose: a raster would have
to be built twice, once per theme, and rebuilt whenever a surface token moved.
Drawn in the DOM it is correct in both themes for free, sharp at any size, and
costs no bytes. It carries the MPN because the part number is what a buyer would
search to find the manufacturer's own photograph — which makes it informative
rather than merely tidy.

### Never

- Another retailer's site, or their CDN, whether copied or hotlinked.
- Marketplace listings (Amazon, eBay, AliExpress, Daraz).
- Any image whose origin cannot be stated in this file.

`scripts/media/build-media.mjs` hard-fails on a source URL matching a known
retailer, and `src/lib/media.test.ts` asserts the same over the committed ledger.

---

## Ingesting an asset

```bash
# 1. Drop the source in, named for the product id it belongs to.
cp ~/Downloads/press-photo.png media/source/amd-ryzen-7-9800x3d.png

# 2. Record where it came from. The build refuses to run without this.
#    media/sources.json:
#    {
#      "amd-ryzen-7-9800x3d": {
#        "source": "https://www.amd.com/en/newsroom/...",
#        "licence": "AMD press kit — partner/reseller use permitted, retrieved terms at <url>",
#        "retrieved": "2026-08-01"
#      }
#    }

# 3. Build. Emits AVIF + WebP at 400/800/1600 and updates the manifest.
npm run media

# 4. Confirm the manifest matches the sources on disk. Runs as part of `npm test`.
npm run media:check
```

Gallery images for a product use suffixed keys — `amd-ryzen-7-9800x3d-2.png`,
`-3.png` — and are listed in that product's `images` array in the catalogue.

### Ledger fields

| Field | Required | Meaning |
|---|---|---|
| `source` | yes | The URL the file came from, or `own-work`. |
| `licence` | yes | The terms, in enough words to be re-checkable. Not just "ok". |
| `retrieved` | yes | ISO date the file and the terms were obtained. |
| `notes` | no | Anything a future reader would need. |

---

## The pipeline

`scripts/media/pipeline.mjs`. Every product image goes through it, so that
photographs taken by different people on different backgrounds end up looking
like one catalogue.

| Step | Value | Why |
|---|---|---|
| Trim | threshold 10 | Padding is meaningless until the source's own empty space is gone. |
| Canvas | square | A grid of mixed aspect ratios cannot be made to look deliberate. |
| Padding | 8% per side | The subject never touches the edge, so a card can round or crop its container without clipping. |
| Background | `--surface-2`, one per theme | Only for opaque sources. |
| Formats | AVIF, then WebP | AVIF is roughly 30% smaller at the same quality; WebP is the fallback. |
| Widths | 400 / 800 / 1600 | Card, detail, 2× detail. |
| LQIP | 20px WebP, inlined | Blur-up without a second request. |

**Transparent sources are left transparent** and emit one asset set instead of
two. That is strictly better — a single asset that is correct in both themes and
stays correct if the surface tokens move. Only opaque sources get a background
baked in, because a product shot on white is a white box on a dark page
otherwise.

Opacity is decided by `sharp.stats().isOpaque`, not by `metadata().hasAlpha`: a
fully opaque PNG carrying a redundant alpha channel is common, and treating that
as transparency would leave the subject floating with no ground behind it.

---

## Banner and interface imagery

Out of scope for this stage and unchanged. Recorded here for completeness.

| Asset | Source | Licence |
|---|---|---|
| `public/assets/Banner/7995937.jpg` | carried from the Angular app | **not established** |
| `public/assets/Banner/pexels-max-fischer-5872177.jpg` | filename indicates Pexels | Pexels licence — free for commercial use, no attribution required; **not verified against the original upload** |
| `public/assets/icons/profile-photo.png`, `profile-user.png` | carried from the Angular app | **not established** |

---

## Assets

*(One row per built asset. Empty until imagery is cleared and ingested; the table
is generated from the same ledger the build reads.)*

| Asset id | Source | Licence | Retrieved |
|---|---|---|---|
| — | — | — | — |
