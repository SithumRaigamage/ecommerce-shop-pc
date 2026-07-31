# PC Shop

A storefront for PC components and pre-built rigs, built with **React 19**, **Vite**, **TypeScript**,
**Tailwind CSS v4** and **shadcn/ui**.

> Previously an Angular 19 app; see `git log` for the migration commit.

## Getting started

```bash
npm install
npm run dev
```

The dev server prints a local URL (default `http://localhost:5173/`) and hot-reloads on save.

## Scripts

| Command                 | What it does                                            |
| ----------------------- | ------------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server                               |
| `npm run build`         | Typecheck (`tsc -b`) then build to `dist/`              |
| `npm run preview`       | Serve the production build locally                      |
| `npm run lint`          | ESLint over the whole project                           |
| `npm test`              | Run the Vitest unit suite once                          |
| `npm run test:watch`    | Vitest in watch mode                                    |
| `npm run test:coverage` | Vitest with a V8 coverage report in `coverage/`         |
| `npm run e2e`           | Playwright end-to-end tests (desktop + mobile)          |
| `npm run e2e:ui`        | Playwright in interactive UI mode                       |

First e2e run needs browsers: `npx playwright install chromium`. The config builds the app
and serves it with `vite preview`, so the tests exercise the real production chunks.

## Project layout

```text
e2e/                  Playwright specs
public/assets/        Static images and the JSON fixtures that back the catalogue
src/components/ui/    shadcn/ui primitives (generated — re-add with the shadcn CLI)
src/components/       App-level components (layout, cart sheet, filters, checkout steps)
src/pages/            One component per route
src/lib/              API access, catalogue normalisation, formatting, `cn` helper
src/routes.ts         Route table as data, so link fixtures can be validated against it
src/store/            Zustand cart store (persisted) + pure total calculations
src/hooks/            `useAsync` data-fetching hook, dummy `useAuth`
src/types/            Shared domain types
```

Anything in `src/components/ui/` is generated and may be overwritten by the shadcn CLI, so it
holds no hand-written logic. Components that need behaviour the generated primitives don't
provide live one level up — see `src/components/PriceSlider.tsx`.

## Adding shadcn/ui components

```bash
npx shadcn@latest add <component>
```

Configuration lives in `components.json`; theme tokens are CSS variables in `src/index.css`.

## Data

The catalogue is served from static JSON in `public/assets/json/` (banners, categories, featured
products, price filters and ~295 sellable products). `src/lib/api.ts` is the single place that
reads them, so swapping in a real HTTP backend means changing that one module.

`Web_Scraper/` holds the Python scripts that populate the product data. Because it regenerates
`products.json`, the app **normalises the catalogue on read** rather than hand-editing the file
(`src/lib/products.ts`, `src/lib/categories.ts`):

- **Category aliases** — the scraper emits `"Laptop"`/`"laptop"`, `"speakers,"`, `"casings"`,
  `"tv"`/`"television"` and similar. `normalizeCategory` folds them onto the canonical slugs in
  `CATEGORIES`, which is also what the sidebar renders.
- **Duplicate ids** — ids repeat across categories (`"1"` is both a PlayStation 5 and a set of
  speakers). `dedupeProductIds` keeps the first occurrence on its bare id and suffixes later ones
  with their category (`1-audio`), so every product has a reachable detail page and the cart
  cannot merge unrelated items.
- **Unsellable rows** — a few entries carry `price: null` and are dropped, since a null price
  sorts as free and cannot be checked out.

`src/lib/categories.test.ts` and `src/lib/content.test.ts` fail if the scraper introduces a
category with no navigation entry, or if a banner/featured fixture points at a route or product
that doesn't exist.

## Cart state

`src/store/cart.ts` holds the live cart, the checkout snapshot and the applied coupon, persisted
to `localStorage` under `pc-shop-cart` so the funnel survives a reload. `orderTotals()` is the
single source of the order maths — the cart drawer, checkout summary and billing page all derive
from it, so they cannot disagree.

Billing reads the order from the store rather than router location state (which is lost on
refresh) and redirects to `/checkout` if nothing is pending. Bump the `version` in the persist
config when the stored shape changes.
