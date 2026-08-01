# PC Shop — design system

Stage 1: token foundation. Everything here lives in `src/index.css`. No component
consumes these yet — Stage 2 migrates components onto the semantic layer.

## Art direction

A dark-first technical instrument for people who compare specifications, not a
consumer retail storefront: dense, quiet, and legible under sustained use. Colour
carries meaning and nothing else — one cool accent reserved exclusively for
interactive affordances, three status hues, and an otherwise achromatic cool
neutral doing all the structural work. Depth comes from surface lightness and
hairline borders rather than shadow, motion is short enough to feel like
acknowledgement rather than animation, and every number on screen is set in a
monospace so columns of prices and specs align.

References: Linear (density, restraint), Vercel dashboard (typographic
discipline), Arc (motion economy).

---

## 1. Colour

Five 11-step ramps in OKLCH. Every step was verified inside the sRGB gamut, so
nothing clips in the browser.

### The neutral ramp is the load-bearing decision

Hue **258** — a cool cast, chosen so the accent (196, also cool) sits in the same
temperature family instead of fighting it. Chroma peaks at 0.017 in the mid-range
and tapers to 0.004 at the extremes, which keeps near-white text from picking up a
visible tint.

Lightness steps are deliberately **not** perceptually even. The profile is a
"dumbbell" — tight where surfaces live, loose through the middle where only text
and icons sit:

| Region | Steps | ΔL between steps | Used for |
|---|---|---|---|
| Dark end | 950→900→800→700 | .048 .048 .056 | the four dark elevation levels |
| Middle | 600→500→400→300 | .102 .110 .115 | text, icons, borders |
| Light end | 200→100→50 | .106 .076 .046 | the three light elevation levels |

A linear ramp across the same span steps **.082 everywhere**. That is too coarse
at the dark end — elevation levels either collapse into each other or jump
visibly — and needlessly fine through the middle, where a wide step costs nothing
because no two adjacent mid-steps are ever used together. The slack was moved to
where it is free.

### Ramps

| Step | neutral 258 | accent 196 | success 155 | warning 82 | danger 22 |
|---|---|---|---|---|---|
| 50 | `#fafcfe` | `#ecfbfb` | `#edfaf1` | `#fff8ed` | `#fff2f1` |
| 100 | `#eaedf1` | `#d1f3f3` | `#d6f2de` | `#feedcf` | `#fee4e2` |
| 200 | `#d0d4da` | `#abe8e8` | `#b5e7c5` | `#fddb9c` | `#fecfcc` |
| 300 | `#adb2b9` | `#7cd8d9` | `#8fd7a8` | `#f8c86b` | `#fdb0ad` |
| 400 | `#888e96` | `#4ec6c7` | `#6bc48d` | `#eeb53d` | `#fd8785` |
| 500 | `#666c75` | `#1db3b4` | `#4fb077` | `#dda319` | `#f2565b` |
| 600 | `#484d56` | `#179697` | `#3e9663` | `#ba8a1d` | `#d93944` |
| 700 | `#2d333b` | `#007375` | `#31784e` | `#896409` | `#b32b35` |
| 800 | `#20252c` | `#045859` | `#255b3b` | `#70520a` | `#8b2028` |
| 900 | `#151a20` | `#034040` | `#1a3f29` | `#4f3909` | `#681a1e` |
| 950 | `#0b0f14` | `#032828` | `#0f2618` | `#302207` | `#400f11` |

### Why hue 196 for the accent

196 sits deliberately **between** Tailwind's teal (185) and cyan (215), so it
reads as neither and cannot be mistaken for a framework default. It is the hue of
instrument backlighting and signal traces — cool enough to sit quietly against a
cool neutral, saturated enough to be the one thing on screen that says *you can
act here*. A warm accent would fight the neutral's cast. Blue is ruled out both by
the brief and because it reads as generic SaaS.

Status hues are likewise offset from Tailwind defaults: success 155 (between green
150 and emerald 160), warning 82 (between amber 75 and yellow 95), danger 22
(between rose 15 and red 27).

### Semantic mapping

| Token | Dark | Light |
|---|---|---|
| `--bg` | neutral-950 | neutral-50 |
| `--surface-1` | neutral-900 | neutral-100 |
| `--surface-2` | neutral-800 | neutral-200 |
| `--surface-3` | neutral-700 | neutral-300 |
| `--border-subtle` | neutral-800 | neutral-200 |
| `--border-default` | neutral-700 | neutral-300 |
| `--border-strong` | neutral-500 | neutral-500 |
| `--fg-primary` | neutral-50 | neutral-950 |
| `--fg-secondary` | neutral-300 | neutral-700 |
| `--fg-tertiary` | neutral-400 | neutral-600 |
| `--fg-disabled` | neutral-600 | neutral-400 |
| `--accent-default` | accent-400 | accent-700 |
| `--accent-hover` | accent-300 | accent-800 |
| `--accent-active` | accent-500 | accent-900 |
| `--accent-subtle-bg` | accent-950 | accent-50 |
| `--on-accent` | neutral-950 | neutral-50 |
| `--success-fg / -bg / -border` | 400 / 950 / 800 | 700 / 50 / 200 |
| `--warning-fg / -bg / -border` | 400 / 950 / 800 | 700 / 50 / 200 |
| `--danger-fg / -bg / -border` | 400 / 950 / 800 | 700 / 50 / 200 |

Light is a **port, not an inversion**: `--fg-secondary` is neutral-300 in dark but
neutral-700 in light, not neutral-650. Each side was mapped and audited on its own.

---

## 2. Contrast audit

**Method.** OKLCH → Oklab → linear sRGB (CSS Color 4 matrices) → clamp to gamut →
WCAG 2.1 relative luminance → `(L₁+0.05)/(L₂+0.05)`. The implementation was
validated against known fixtures before use: white-on-black returns exactly
21.00:1, and `#767676` on white returns 4.54:1. Every figure below is computed,
not estimated. Thresholds: **4.5:1** normal text, **3.0:1** large text and UI
component boundaries.

### Dark — text

| Pair | Ratio | |
|---|---|---|
| fg-primary on bg | 18.70:1 | AAA |
| fg-primary on surface-1 | 17.06:1 | AAA |
| fg-primary on surface-2 | 15.01:1 | AAA |
| fg-primary on surface-3 | 12.41:1 | AAA |
| fg-secondary on bg | 9.03:1 | AAA |
| fg-secondary on surface-1 | 8.24:1 | AAA |
| fg-secondary on surface-2 | 7.24:1 | AAA |
| fg-tertiary on bg | 5.84:1 | AA |
| fg-tertiary on surface-1 | 5.33:1 | AA |
| fg-tertiary on surface-2 | 4.68:1 | AA |
| accent on bg | 9.36:1 | AAA |
| accent on surface-1 | 8.54:1 | AAA |
| accent-hover on bg | 11.63:1 | AAA |
| accent-active on bg | 7.45:1 | AAA |
| on-accent on accent | 9.36:1 | AAA |
| accent on accent-subtle-bg | 7.63:1 | AAA |
| success-fg on success-bg | 7.58:1 | AAA |
| warning-fg on warning-bg | 8.36:1 | AAA |
| danger-fg on danger-bg | 6.87:1 | AA |

### Dark — non-text (3.0:1)

| Pair | Ratio | |
|---|---|---|
| border-strong on bg | 3.65:1 | AA |
| border-strong on surface-1 | 3.33:1 | AA |
| focus ring (accent) on bg | 9.36:1 | AAA |
| fg-disabled on bg | 2.28:1 | exempt — WCAG 1.4.3 excludes inactive components |

### Light — text

| Pair | Ratio | |
|---|---|---|
| fg-primary on bg | 18.70:1 | AAA |
| fg-primary on surface-1 | 16.33:1 | AAA |
| fg-primary on surface-2 | 12.90:1 | AAA |
| fg-primary on surface-3 | 9.03:1 | AAA |
| fg-secondary on bg | 12.41:1 | AAA |
| fg-secondary on surface-1 | 10.85:1 | AAA |
| fg-secondary on surface-2 | 8.57:1 | AAA |
| fg-tertiary on bg | 8.22:1 | AAA |
| fg-tertiary on surface-1 | 7.18:1 | AAA |
| fg-tertiary on surface-2 | 5.67:1 | AA |
| accent on bg | 5.47:1 | AA |
| accent on surface-1 | 4.78:1 | AA |
| accent-hover on bg | 8.01:1 | AAA |
| accent-active on bg | 11.32:1 | AAA |
| on-accent on accent | 5.47:1 | AA |
| accent on accent-subtle-bg | 5.28:1 | AA |
| success-fg on success-bg | 4.96:1 | AA |
| warning-fg on warning-bg | 5.11:1 | AA |
| danger-fg on danger-bg | 5.79:1 | AA |

### Light — non-text (3.0:1)

| Pair | Ratio | |
|---|---|---|
| border-strong on bg | 5.13:1 | AAA |
| border-strong on surface-1 | 4.48:1 | AA |
| focus ring (accent) on bg | 5.47:1 | AAA |
| fg-disabled on bg | 3.20:1 | exempt — as above |

**Zero failures.** The two tightest margins are dark `fg-tertiary on surface-2`
(4.68:1) and light `accent on surface-1` (4.78:1) — both real constraints. Do not
darken `fg-tertiary` or lighten `accent-default` in light mode without re-running
the audit.

`--border-subtle` and `--border-default` are decorative separators and are not
held to 3.0:1. Any border that is the *only* boundary of a control must use
`--border-strong`.

---

## 3. Typography

Self-hosted via `@fontsource-variable`, roman only, no italic files, no runtime
network call. Subsets carry `unicode-range`, so a Latin reader downloads only the
Latin file.

| Token | Family | Role |
|---|---|---|
| `--font-sans` | Geist Variable | UI and body. Neo-grotesque engineered for screen density. |
| `--font-display` | Instrument Sans Variable | Headings. More character than Geist; tight tracking holds up at large sizes. |
| `--font-mono` | JetBrains Mono Variable | Every numeral. |

Inter was excluded deliberately — it now reads as the absence of a decision.

**The monospace is the single highest-leverage choice in this stage.** Every
price, spec value, SKU, dimension and count is set in JetBrains Mono with
`tnum` (fixed digit advance, so figures align in a column), `cv01` (disambiguates
`1` from `l` and `I`) and `zero` (slashed zero, which matters on part numbers).

### Scale

Optical, not a fixed ratio. Steps exist for jobs, then tracking is corrected by
eye: negative on display sizes, which set too loose by default; neutral at body;
positive at the smallest sizes, which set too tight and lose legibility.

| Token | Size | Line-height | Tracking | Use for |
|---|---|---|---|---|
| `--text-xs` | 11px | 16px | +0.010em | Micro labels, table meta, badges |
| `--text-sm` | 12px | 18px | +0.006em | Secondary UI text, captions, helper text |
| `--text-base` | 14px | 20px | 0 | UI default |
| `--text-lg` | 16px | 24px | −0.005em | Long-form body, product description |
| `--text-xl` | 18px | 26px | −0.010em | Card titles |
| `--text-2xl` | 22px | 28px | −0.015em | Section subheads |
| `--text-3xl` | 28px | 34px | −0.020em | Section heads |
| `--text-4xl` | 36px | 40px | −0.025em | Page titles |
| `--text-5xl` | 48px | 50px | −0.030em | Hero display — at most one per page |

Body default is **14px**, not 16px. This is a dense technical interface; 16px body
in a spec table wastes vertical space that comparison work needs.

**Usage rules.** Display font at `--text-2xl` and above only. Never set body copy
in `--font-display`. Never set a heading in `--font-mono` — mono is for values, not
labels. Line length caps at ~72ch for `--text-lg` prose.

---

## 4. Spacing

4px base (`--spacing: 0.25rem`), so Tailwind's numeric scale is `p-1` = 4px,
`p-2` = 8px, and so on. **Components reference the semantic aliases, never raw
numbers.**

| Alias | Value | Use for |
|---|---|---|
| `--spacing-stack-tight` | 8px | Label above control, icon + text |
| `--spacing-stack` | 12px | Between related blocks inside a card |
| `--spacing-card-padding` | 16px | Inner padding of a surface |
| `--spacing-gutter` | 24px | Page edge, column gap |
| `--spacing-section` | 64px | Between major page sections |

---

## 5. Elevation

**Dark UI does not use drop shadows for depth.** A shadow reads as depth because
it implies light occluded by the object — on a near-black background there is no
light to occlude, so a dark shadow is invisible and a soft black blur only muddies
the surface beneath it. What actually reads as *closer* on dark is a lighter
surface plus a 1px highlight along the top edge, simulating a light source above.

Shadow is reintroduced only from level 2, and only for elements that genuinely
float over content.

| Level | Dark bg | Border | Top highlight | Shadow | Use for |
|---|---|---|---|---|---|
| 0 | `--bg` neutral-950 | — | — | none | Page |
| 1 | neutral-900 | subtle | 1px `oklch(1 0 0 / .06)` | none | Cards, panels, sidebar |
| 2 | neutral-800 | default | 1px | `0 4px 12px -2px` @ 32% | Dropdowns, popovers |
| 3 | neutral-700 | default | 1px | `0 16px 40px -8px` @ 48% | Modals, sheets |

Light mode inverts the logic: surfaces move *toward white* as they rise, shadows
are legible so they carry the depth, and the top highlight is set to
`transparent`. Shadow opacities drop to 10% / 16% — the same values used on dark
would read as dirt on a white page.

---

## 6. Radius

Nested radii must satisfy **inner = outer − inset**, or the curves run
non-concentric and the nesting reads as a mistake rather than a decision.

| Token | Value | Applies to |
|---|---|---|
| `--radius-xs` | 4px | Chips, tags, inner elements |
| `--radius-sm` | 6px | Items inside a segmented control |
| `--radius-md` | 8px | Buttons, inputs, selects |
| `--radius-lg` | 12px | Cards, panels |
| `--radius-xl` | 16px | Modals, sheets, popovers |
| `--radius-2xl` | 20px | Full-bleed feature panels |
| `--radius-full` | 9999px | Pills, avatars, the cart badge |

Pairs that satisfy the rule:

| Container | Outer | Inset | Inner |
|---|---|---|---|
| Card | lg 12 | stack-tight 8 | xs 4 |
| Modal | xl 16 | stack 12 | xs 4 |
| Segmented control | md 8 | 2 | sm 6 |
| Input with inline chip | md 8 | 4 | xs 4 |

This replaces the old flat `--radius: 0.625rem` with its `calc(−4px/−2px/+4px)`
derivations, which produced 6px/8px/10px/14px — four values that served no
articulated purpose and never nested correctly.

---

## 7. Motion

Durations are short on purpose. An instrument acknowledges input immediately and
never makes you wait for a transition before the next action.

| Token | Value | Use for |
|---|---|---|
| `--duration-instant` | 100ms | State flips that must feel like no delay |
| `--duration-fast` | 150ms | Hover, focus, small colour changes |
| `--duration-base` | 250ms | Popovers, dropdowns, tab panels |
| `--duration-slow` | 400ms | Sheets, modals, anything crossing the viewport |

| Easing | Curve | Use for |
|---|---|---|
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default. Leaves immediately, settles slowly. |
| `--ease-entrance` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Elements arriving |
| `--ease-exit` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Elements leaving |
| `--ease-spring` | `cubic-bezier(0.34, 1.35, 0.64, 1)` | Size or position only |

`--ease-standard` is a custom curve rather than `ease-in-out` because
`ease-in-out` has a slow start — a perceptible dead zone between click and
response that makes an interface feel heavy. This curve has zero initial
horizontal slope, so the response begins on the first frame.

`--ease-spring` overshoots slightly. It is for things that **change size or
position** and never for colour or opacity: an overshooting colour reads as a
rendering bug.

Under `prefers-reduced-motion: reduce` the tokens themselves collapse to `1ms` /
`linear`, so anything referencing them complies without each component
remembering to, and a global rule clamps animation and transition durations.

---

## 8. Do not

- **Do not use accent as decoration.** It marks interactive affordances and focus
  rings. Not headings, not prices, not icons, not borders on a static card, and
  never as a background wash.
- **Do not add a `tailwind.config.js`.** This project is CSS-first; the config
  file would silently take precedence over `@theme` and split the source of truth.
- **Do not put raw values in components.** No `p-[13px]`, no `#0b0f14`, no
  `text-[15px]`. If a value is needed and no token fits, add the token.
- **Do not reference a ramp step from a component.** Components use semantic
  tokens (`--fg-secondary`), never `--color-neutral-300`. The ramp is the
  vocabulary the semantic layer is built from, not an API.
- **Do not use drop shadows for depth on dark surfaces.** Use elevation levels.
- **Do not introduce glassmorphism, gradient meshes, or decorative shadows.**
- **Do not set numerals in the sans stack.** Prices, specs, SKUs and measurements
  are mono, or the columns stop aligning.
- **Do not add a second accent hue.** Status colours are not accents and are never
  used for emphasis.
- **Do not adjust a colour without re-running the contrast audit.** Several pairs
  sit within 0.2 of the AA threshold.
- **Do not animate for longer than `--duration-slow`,** and do not animate
  `width`, `height`, `top` or `left` where a transform will do.

---

## Known gaps at the end of Stage 1

- **The mono numeral rule is wired but not applied.** `index.css` styles
  `[data-numeric]`; no component sets that attribute yet, so prices still render
  in Geist. Applying it is a Stage 2 component change.
- **shadcn/ui compatibility aliases are still in place.** `--color-primary`,
  `--color-muted`, `--color-card` and the rest map onto the semantic layer so the
  existing components keep working untouched. They should be deleted once
  components move to semantic names. Note the collision: shadcn's `accent` means
  *neutral hover surface*, so the brand accent is exposed as `accent-default` /
  `-hover` / `-active` / `-subtle` / `on-accent`.
- **Accent currently appears on non-affordances.** `ProductGrid` sets prices in
  `text-primary`, which now resolves to the accent. That violates the rule above
  and is a component fix.
- **Elevation levels 2 and 3 are defined but unused;** no popover or modal has been
  migrated onto them.
