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
scripts/              Build-time checks (catalogue validation)
public/assets/        Static images and the JSON fixtures that back the catalogue
src/components/ui/    shadcn/ui primitives (generated — re-add with the shadcn CLI)
src/components/       App-level components (layout, cart sheet, filters, theme, error boundary)
src/pages/            One component per route
src/lib/              API access, catalogue schema, facets, theme, formatting, `cn` helper
src/routes.ts         Route table as data, so link fixtures can be validated against it
src/store/            Zustand cart store (persisted) + pure total calculations
src/hooks/            `useAsync`, `useFacets`, `useTheme`, dummy `useAuth`
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

The catalogue is served from static JSON in `public/assets/json/`: 48 curated products across the
8 categories in `CATEGORIES`, plus banners, category tiles, featured products and the price-filter
range. `src/lib/api.ts` is the single place that reads them, so swapping in a real HTTP backend
means changing that one module.

Every product carries `title`, `brand`, `mpn`, `price` (LKR), `category` and a `specs` object whose
required keys depend on the category — CPUs need `socket`/`cores`/`threads`/`tdp`, GPUs need
`vram_gb`/`tdp`/`length_mm`, and so on. The contract lives in `src/lib/catalogue-schema.ts`.

`image` is `null` for every product until imagery is sourced; `ProductImage` renders a labelled
placeholder for it.

### Validation

```bash
npm run validate:catalogue   # also runs as the first step of `npm test`
```

`scripts/validate-catalogue.ts` fails the build if a record is missing a required field, carries a
non-positive price, duplicates an id, uses an unknown category, or is missing a spec its category
requires. Alongside it, `src/lib/categories.test.ts` and `src/lib/content.test.ts` fail if a
category has no navigation entry (or a nav entry has no products), or if a banner/featured fixture
points at a route or product that doesn't exist.

`Web_Scraper/` holds the Python scripts that produced the original catalogue. It no longer feeds
`products.json` — the seed above is hand-curated and validated.

### Filters

Catalogue facets live in the URL, not component state, so they survive navigation, reload, back /
forward and sharing. `src/lib/facets.ts` defines the codecs and `CATALOGUE_FACETS`; `useFacets`
binds them to `useSearchParams`. Adding a facet (brand, socket, sort) means adding one entry to
`CATALOGUE_FACETS` — no page code changes.

## Cart state

`src/store/cart.ts` holds the live cart, the checkout snapshot and the applied coupon, persisted
to `localStorage` under `pc-shop-cart` so the funnel survives a reload. `orderTotals()` is the
single source of the order maths — the cart drawer, checkout summary and billing page all derive
from it, so they cannot disagree.

Billing reads the order from the store rather than router location state (which is lost on
refresh) and redirects to `/checkout` if nothing is pending. Bump the `version` in the persist
config when the stored shape changes.

## Theming

`ThemeProvider` (`src/components/ThemeProvider.tsx`) applies a `dark`/light class to `<html>`,
resolving stored preference → `prefers-color-scheme` → **dark** as the default. An inline script in
`index.html` runs the same resolution before first paint to avoid a flash of the wrong theme — keep
the two in sync if the logic changes.

There is no toggle UI yet; `useTheme().setPreference('light' | 'dark' | 'system')` is the seam one
will use.
