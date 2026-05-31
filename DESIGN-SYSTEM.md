# Achiote — Design System (LOCKED)

This is the authoritative design system for the Achiote site. It is **set in stone**.
Do not change tokens, fonts, the tagline, or the safety guardrails without the owner's
explicit approval. Everything below is implemented and live on `achiote.kyanitelabs.tech`.

> Single source of truth for tokens lives in **`site.css`** (`:root`). Page-local `<style>`
> blocks consume those tokens and must not redefine them.

---

## 1. Voice & intent

Dark, warm, heritage-archival. A "museum of food memory," not a SaaS landing. Universal —
this is for **every** diaspora and ancestry (incl. European), never coded to one culture.

**Copy rules (hard):**
- **No em-dashes or en-dashes anywhere** (the owner never uses them). Use commas, periods,
  colons, or parentheses. This is enforced in static copy, app JS, and the model prompt, and
  web-search snippets are sanitized server-side.
- Plain words, short sentences, active voice, no exclamation points, no buzzwords
  ("delve", "tapestry", "crucial", "elevate", "unleash", "testament").

**Locked tagline (mission section, `index.html`):**
> The fortune in your heart can't be lost or left behind. Let's find it again.
> *For the ancestors who knew it by heart, and the generations who will.*

---

## 2. Color tokens (`site.css :root`)

| Token | Hex | Use |
|---|---|---|
| `--bg-0` | `#1d0e08` | page base (warm charred mahogany) |
| `--bg-1` | `#2a160d` | cards / raised surfaces |
| `--bg-2` | `#3a2013` | highest surface |
| `--seed` | `#571208` | darkest red-brown |
| `--achiote` | `#b3371b` | THE brand red (buttons, accents, hero glow) |
| `--achiote-bright` | `#d44a28` | hover / emphasis |
| `--achiote-deep` | `#781d10` | borders, parchment ink-red |
| `--text-0` | `#fcefda` | headings (cream) |
| `--text-1` | `#ecd8ba` | body |
| `--text-2` | `#c2a47e` | muted / labels |
| `--gold` | `#eaa53e` | the only spark; emphasis text, dedication, labels |
| `--gold-soft` | `#f4cd82` | soft highlight |

**Contrast rules:** cream-on-dark is AAA. **Gold is text on dark only — never as text on red**
(fails contrast). Emphasis/accent **text** uses `--gold` (red `#b3371b` as text on dark fails ~2.5:1,
so it is reserved for fills/borders/glows, not text). Parchment surfaces use dark ink
(`#2a1a0f`/`#33220f`) + `--achiote-deep`.

---

## 3. Typography

- **Junction** (League of Moveable Type, **SIL OFL**), **self-hosted** WOFF2 in `proof/fonts/`
  (subset Latin + Latin-Extended). `--font-display` + `--font-body` both Junction.
- **Weights are the hierarchy:** Junction ships **300 / 400 / 700 only**.
  - Display / headings / the dedication signoff = **700**.
  - **Body copy = 400** (never 700 — bolding paragraphs is what broke the mission section once).
  - Mono labels/evidence = `--font-mono` (system mono).
- Zero-CLS: metric-matched `@font-face "Junction Fallback"` (Arial, `size-adjust:106%`,
  `ascent/descent 75%/25%`). `font-synthesis: none`. `bg-bold` woff2 is `<link rel=preload>`ed.
- Fluid scale via `clamp()` with a rem term (zoom-safe). Measure 45–75ch. `text-wrap: balance`
  on headings, `pretty` on body. Never justified.
- Non-Latin scripts: `type-scripts.css` per-script `:lang()` stacks (CJK/Arabic/Indic/etc.).
  Junction is Latin-only by design.

---

## 4. Background texture (LOCKED)

- `proof/images/bg-texture.jpg` (handmade-paper, ~222KB) as a **fixed `cover` background layer
  on `body`**, with two **very gentle** warm radial glows on top (red `0.10`, gold `0.07`).
  Hero-level glow is `0.13` max with soft falloff. Keep glows subtle — a past version was a harsh
  hotspot.
- It is `<link rel="preload" as="image">`ed on every page (prevents the brown flash on navigation).
- Texture must sit **behind content** as a body background layer (not a `::before` with negative
  z-index — that paints behind the page canvas and only shows in the overscroll gutter).

---

## 5. Components

- **Buttons:** no pills. `--r-btn: 6px`, solid `--achiote` fill, cream label, sliding arrow,
  full state set (hover bright / active deep+translate / focus gold ring / disabled). Ghost = 1px
  keyline.
- **Cards:** solid `--bg-1` (no transparency — texture must not bleed through; that's why the
  "summarizer" and "note on form" cards were made solid).
- **Memory Receipt:** a **parchment slip** (`#efe3cb`, ruled lines, 4px `--achiote` top edge,
  dark ink, mono labels). Deliberately light to pop off the dark page; used on home, app, week6.
- **Proof cards (week6):** image with a **full dark scrim** (`linear-gradient` 0.35→0.58→0.92)
  so overlaid text stays readable on busy photos.
- **App composer:** sticky, **`background: transparent`** so the fixed page texture shows through
  (no gradient fade). Input bar is `#fffdf8`.
- **Mission section:** kicker (small gold) → tagline (big 700 display) → supporting paragraph
  (`.mission-sub`, **400 body**, muted) → signoff (`.signoff`, prominent **gold 700 display**,
  ~1.2–1.55rem). The hierarchy is the point; do not flatten the weights.
- **Motion:** `reveal.js` adds a subtle fade-up to `main > section` on scroll. Gated by
  `prefers-reduced-motion` (no-JS / reduced-motion users see everything immediately).

---

## 6. Food-safety guardrails (NON-NEGOTIABLE)

Three layers, all live:
1. **Model SYSTEM_PROMPT** (`achiote/src/http-server.ts`): allergens override everything; never
   suggest tasting/buying/substituting anything that could contain a stated allergen; name common
   allergens; never claim "safe/allergen-free/medically safe"; not medical/allergy/nutrition advice.
2. **Visible disclaimer** in the app (`app.html`, by the composer + full text in the footer).
3. **`rules.md` → "Safety is a hard boundary"** in the ICM submission folder.

---

## 7. Accessibility

WCAG AA+ contrast (verified), `rem` sizing, fluid `clamp()` (200% zoom safe), `:focus-visible`
gold ring, `prefers-reduced-motion` honored, skip link, real heading order, `role` on decorative
SVGs, per-script fonts + RTL for Arabic/Hebrew.

---

## 8. Do NOT change without owner approval

Palette hexes · Junction as the typeface · body=400 / display=700 rule · the tagline + signoff
wording · the no-em-dash rule · the food-safety guardrails · the parchment receipt · the texture
treatment + gentle glows.
