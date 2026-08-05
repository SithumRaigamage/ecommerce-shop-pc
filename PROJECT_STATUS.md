# Project Status — ecommerce-shop-pc

Commit `f2d06b9`, branch `migrate/react-shadcn`. Versions from `package-lock.json`.

## 1. Stack

- **Framework**: React 19.2.8 SPA, Vite 6.4.3, react-router-dom 7.18.2 (`BrowserRouter`, `main.tsx:9`). No SSR.
- **Language**: TypeScript 5.7.3, `strict`, 3 project refs (app/node/e2e).
- **Styling**: Tailwind 4.3.3 via `@tailwindcss/vite`; **no `tailwind.config.*`** — CSS-first in `index.css`. shadcn/ui (new-york, slate, cssVariables), `radix-ui` 1.6.7, `lucide-react` 0.475.0, `tw-animate-css` 1.4.0.
- **Database + ORM**: **not found** — no prisma/drizzle/mongoose/sequelize/typeorm/supabase/firebase. Static JSON in `public/assets/json/`.
- **Backend**: **not found** — no `api/`/`server/`; `lib/api.ts` fetches local JSON only.
- **State**: zustand 5.0.14 + `persist` → `localStorage` `pc-shop-cart` v1 (`store/cart.ts:70-121`). No server-cache lib.
- **Forms**: react-hook-form 7.83.0 + zod 3.25.76 + `@hookform/resolvers` 3.10.0.
- **Auth**: **not found** — `useAuth.ts:11` hardcodes `DEMO_USER`; `:15-16` compares constants to themselves → `isLoggedIn` always `true`.
- **Hosting/deploy**: **not found** — no Dockerfile/vercel.json/netlify.toml/`.env*`. Only `.github/workflows/testing.yml`.
- **Tests**: Vitest 3.2.7 + Testing Library (jsdom), 81 tests/8 files. Playwright 1.62.1, 52 e2e (chromium + Pixel 7) vs `vite preview`.

## 2. Routes

All client-rendered. Declared `App.tsx:37-70`, mirrored as data in `routes.ts:6-27`.

| Path | File | Status | Note |
|---|---|---|---|
| `/` | `Home.tsx` | WORKING | Carousel/categories/featured from JSON |
| `/product-grid` | `ProductGrid.tsx` | WORKING | Reads `?category` |
| `/product-overview/:id` | `ProductOverview.tsx` | WORKING | Comments tab stubbed |
| `/checkout` | `Checkout.tsx` | WORKING | Real totals + coupons |
| `/billing` | `Billing.tsx` | PARTIAL | Validates → `console.info` (`:90`) |
| `/thankyou` | `OrderMessage.tsx` | STUB | Static; no order reference |
| `/support` | `Support.tsx` | PARTIAL | `console.info` (`:64`); uploads discarded |
| `/login`, `/logout` | `SignIn.tsx` | STUB | `console.info` (`:34`); `/logout` renders login form, logs nothing out |
| `/settings` | `Profile.tsx` | STUB | All actions `notImplemented` (`:27`) |
| `/category/:slug` | `CategoryRedirect.tsx` | WORKING | Redirects to grid |
| `/build` `/deals` `/warranty` `/installation` `/contact` `/faq` `/shipping` `/returns` `/track-order` | `ComingSoon.tsx` | PLACEHOLDER | 9 routes, one static page |
| `*` | `NotFound.tsx` | WORKING | |

## 3. Data model

No database. Types in `types/index.ts`. Fixtures: `products.json` 299 raw (~295 after filtering), `banner.json` 8, `categories.json` 8, `featuredProducts.json` 6, `filters.json` 1, `webscraper.json` 232 (**never read by any code**).

- **Product** (`:36-51`): `id,title,price,image:string`; `images?,colors?:string[]`; `sizes?:Size[]`; `category:string`; `rating?,reviewCount?,orderCount?:number`; `description?`; `faqs?:Faq[]`; `specifications?:{name,value}[]`; `files?:{name,url}[]`.
- **Banner** (`:1-11`), **Category** (`:13-20`), **FeaturedProduct** (`:22-34`). `FeaturedProduct.productId → Product.id` is the only relationship.
- **CartItem** (`:60-65`): `product:Pick<Product,'id'|'title'|'price'|'image'>`, `color`, `size:Size`, `quantity`.
- Read-boundary normalisation: `lib/products.ts` (`normalizeCatalogue`/`dedupeProductIds`/`isSellable`), `lib/categories.ts` (`normalizeCategory`, 22 `CATEGORIES`).

**Never read**: `FilterOptions.priceRange.currency` (`:56`); `Category.description` (`:16`) — `Home.tsx:153-176` renders name + price only; `useAuth().user` — only `isLoggedIn` destructured (`SiteHeader.tsx:28`); `CartItem.size.description` — shown pre-add (`ProductOverview.tsx:213`), never in cart/checkout.

## 4. Features

| Feature | Where | Status | Missing |
|---|---|---|---|
| Catalogue browsing | `ProductGrid`, `SideNav` | WORKING | Pagination; all matches render at once |
| Search | — | **not found** | No search input exists |
| Filtering/facets | `FilterSection`, `PriceSlider` | PARTIAL | Max-price only; no brand/rating/sort/counts |
| Product detail | `ProductOverview` | WORKING | — |
| Cart | `store/cart.ts`, `CartSheet` | WORKING | Stock checks |
| Checkout | `Checkout.tsx` | PARTIAL | No order submission |
| Payment | `Billing.tsx` | PARTIAL | No gateway; card number only non-empty |
| Quotation/RFQ | — | **not found** | |
| PC builder | `/build`→ComingSoon | PLACEHOLDER | Route only |
| Compatibility checking | — | **not found** | |
| User accounts | `SignIn`,`Profile`,`useAuth` | STUB | No auth/session/persistence |
| Admin | — | **not found** | |
| Warranty/support | `Support.tsx` | PARTIAL | Console-only; file inputs (`:201-206`) sit outside RHF and the zod schema → uploads discarded |
| Reviews | `ProductOverview:155-162` | STUB | Counts from JSON; no list or submission (`:312`) |
| Order history | — | **not found** | |

## 5. UI

**Tokens** (`index.css`, oklch; `:root` `:40-70`, `.dark` `:72-98`): `--background: oklch(1 0 0)`, `--foreground: oklch(0.129 0.042 264.695)`, `--primary: oklch(0.546 0.245 262.881)` (blue-600), `--muted-foreground: oklch(0.554 0.046 257.417)`, `--destructive: oklch(0.577 0.245 27.325)`, `--border`/`--input: oklch(0.929 0.013 255.508)`, `--ring: oklch(0.546 0.245 262.881)`. **Radii**: `--radius: 0.625rem`; sm/md/lg/xl = −4px/−2px/+0/+4px (`:7-10`). **No custom spacing scale or shadow tokens** — Tailwind defaults. `--sidebar*` (8 vars, `:63-70`) have **zero usages**.

**Typography**: no `@font-face`, font `<link>`, or `--font-*` → Tailwind default `ui-sans-serif` stack. Weights/scale are utility classes only.

**Components** (usages = app files, excluding `ui/` and tests): `Button` 12 · `Card` 9 · `Input` 7 · `Separator` 5 · `ProductImage` 5 (`src,alt,className`) · `Skeleton` 4 · `Form*` 3 · `Checkbox` 3 · `CheckoutSteps` 3 (`current:1|2|3`) · `Sheet` 2 · `Label` 2 · `SideNav` 2 · `Accordion`/`Tabs`/`Select`/`RadioGroup`/`Textarea`/`DropdownMenu`/`Toaster`/`PriceSlider` 1 each · **`Badge` 0 — dead file**.

**Layout**: flex shell (`MainLayout.tsx:35-49`), sidebar `w-44` sticky `hidden lg:block`. Containers `max-w-7xl` (header/footer), `max-w-md`, `max-w-sm`, `max-w-prose`. No shared grid system — per-page `grid-cols-*`. Breakpoints used: `lg:` 46, `md:` 22, `sm:` 12, `xl:` 4; **`2xl:` never used**.

**Dark mode**: `@custom-variant dark` (`:4`) + full `.dark` token block (`:72`) exist, but **nothing ever adds the `.dark` class** — no toggle, no `prefers-color-scheme`, no provider, zero `dark:` utilities outside `ui/`. Unreachable. Only `Toaster` is `theme="system"` (`ui/sonner.tsx:13`).

## 6. UX

| Surface | Loading | Empty | Error | Success | Optimistic | Skeleton | Keyboard | Focus mgmt |
|---|---|---|---|---|---|---|---|---|
| Home carousel | ✓ | ✓ | ✗ | N/A | N/A | ✓ | ✓ | ✗ no `aria-live`; pauses on hover only |
| Home categories | ✗ | ✗ | ✗ | N/A | N/A | ✗ | ✓ | N/A |
| Home featured | ✗ | ✗ | ✗ | N/A | N/A | ✗ | ✓ | N/A |
| Newsletter | ✗ | N/A | ✗ | ✗ `preventDefault` only | N/A | ✗ | ✓ | ✗ |
| Product grid | ✓ | ✓ | ✗ | N/A | N/A | ✓ ×6 | ✓ | ✗ |
| Price filter | N/A | N/A | N/A | N/A | ✓ local | N/A | ✓ arrows/Home/End | N/A |
| Product detail | ✓ | ✓ + CTA | ✗ | ✓ toast | N/A | ✓ | ✓ | ✗ tab panel unfocused |
| Add to cart | N/A | N/A | ✓ toast guards | ✓ toast | ✓ | N/A | ✓ | ✗ |
| Cart sheet | N/A | ✓ | ✗ | ✓ badge + `aria-live` qty | ✓ | ✗ | ✓ | ✓ Radix trap/restore |
| Checkout | ✗ | ✓ + CTA | ✗ | ✓ coupon toasts | ✓ | ✗ | ✓ | ✗ |
| Billing | ✗ | ✓ redirect | ✓ field errors | ✗ navigates only | N/A | ✗ | ✓ | ✗ no focus-to-error |
| Support | ✗ | N/A | ✓ field errors | ✓ toast + reset | N/A | ✗ | ✓ | ✗ |
| Sign in | ✗ | N/A | ✓ field errors | ✓ toast (says unwired) | N/A | ✗ | ✓ | ✗ |
| Profile | ✗ | N/A | ✗ | ✓ toast (says unwired) | N/A | ✗ | ✓ | ✗ |
| Route transition | ✓ Suspense | N/A | ✗ no boundary | N/A | N/A | ✓ | N/A | ✗ scroll-top only (`MainLayout:30`) |

**Fetch errors never surface.** `useAsync` returns `error` (`useAsync.ts:14`) but no page destructures it — all 6 call sites take `data`/`loading` only, so a failed fetch renders an empty section silently. No `ErrorBoundary` anywhere.

**Filter state**: `category` is in the URL (`useSearchParams`, `ProductGrid.tsx:13`) — shareable, history-aware. `maxPrice` is component state only (`:22`) — absent from the URL, lost on navigation, unrestorable by back/forward.

**Back/forward**: works for routes and category; `CategoryRedirect` uses `<Navigate replace>` so it doesn't trap history. Caveats: price filter not restored, and every `pathname` change force-scrolls to top, discarding scroll position on back.

**Validation**: client-only (zod + RHF) on Billing, Support, SignIn — no server validation exists because there is no server. Newsletter uses native `required` only (`Home.tsx:259`). Billing swaps schemas via a dynamic resolver (`:53-56`) so `cardNumber` is field-level when paying by card.

## 7. Accessibility — findings

- `alt=""` on 5 content-bearing images: `Home.tsx:87` (banner artwork — the slide's primary visual), `SignIn.tsx:43`, `Support.tsx:74`, `ComingSoon.tsx:17`, `SiteHeader.tsx:82` (avatar).
- Duplicated accessible names: `View Details` on every grid card (`ProductGrid.tsx:72`), `Learn More` on every featured card (`Home.tsx:222`), `Browse products` on two pages (`Checkout.tsx:47`, `ProductOverview.tsx:67`).
- Focus ring suppressed on the quantity input: `focus-visible:ring-0` (`ProductOverview.tsx:239`).
- **No skip link**; the 22-item sidebar precedes `<main>` on every page.
- Carousel has `aria-roledescription="carousel"` (`Home.tsx:71`) but no `aria-live` — slide changes unannounced; autoplay pauses on hover only (`:74-75`), not on focus.
- Support file inputs (`Support.tsx:201-206`) are labelled but unregistered — the label implies a control that discards input.
- Contrast risk: `--muted-foreground` on `--background` at `text-sm`/`text-xs` (`Home.tsx:169`, cart summary) — near 4.5:1, unverified.
- Clean: `<html lang="en">` (`index.html:2`); no `div`/`span` with `onClick` — all clickables are `<button>`/`<a>`.

## 8. Known gaps

- **No `TODO`/`FIXME`/`HACK` comments and no commented-out blocks** in `src/` or `e2e/`. `catch` blocks: 4, **none empty** (`useAsync.ts:28`, `api.ts:28`, `api.ts:57`, `ProductOverview.tsx:77`).
- Mock auth: `hooks/useAuth.ts:11,15-16`.
- Submissions logged, not sent: `Billing.tsx:90`, `Support.tsx:64`, `SignIn.tsx:34`.
- Hardcoded business values: `SHIPPING_FEE = 300`, `TAX_RATE = 0.08`, `COUPON_CODES` (`store/cart.ts:5-12`) — coupons are client-side and trivially discoverable.
- `Profile.tsx:27-29` all actions are toasts; `ProductOverview.tsx:312` Comments tab hardcoded empty.
- Dead code: `ui/badge.tsx` (0 imports); `--sidebar*` tokens (`index.css:63-70`); `webscraper.json` (232 records).
- Data rot: 287/299 product images are `www.nanotek.lk` URLs returning 404; 12 local files exist. `ProductImage.tsx:29-38` masks this with a placeholder.
- 4 rows carry `price: null` and are silently dropped by `isSellable` (`lib/products.ts:47-56`) — no logging.
- `/logout` (`App.tsx:47`) renders the sign-in form and performs no logout.

## 9. What I'd want reviewed

1. **`lib/products.ts:19-40` `dedupeProductIds`** — 9 ids are reused across 21 products; the fix keeps the first occurrence's bare id and suffixes the rest by category. Ids are URLs, so this holds only while the scraper's output order does. Nothing verifies that.
2. **`store/cart.ts:70-121` persist config** — `version: 1`, no `migrate`. A `CartItem` shape change rehydrates stale localStorage unchecked; `partialize` also lets `checkoutItems` outlive a cart the user believes cleared.
3. **`pages/Billing.tsx:53-56, 60, 95-104`** — dynamic resolver plus the `placingOrder` ref guarding the empty-cart `<Navigate>`. Correctness depends on render ordering confirmed only via e2e, not reasoning.
4. **`hooks/useAsync.ts:20-38`** — `deps: unknown[]` with an eslint-disable on exhaustive-deps; `ProductGrid.tsx:16-19` passes an inline closure, so correctness rests entirely on a hand-written dep array.
5. **`lib/categories.ts:41-52` `CATEGORY_ALIASES`** — `apple→laptop`, `console→gaming`, `live→streaming`, `expansion→networking` are inferred from sampling titles, not a spec. `categories.test.ts` enforces coverage, not mapping correctness.
