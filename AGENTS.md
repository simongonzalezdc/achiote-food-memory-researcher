# AGENTS.md — Achiote handoff (Codex: start here)

> **Status: SHIPPED and LIVE** at https://achiote.kyanitelabs.tech. This document is the
> authoritative handoff. The design, copy, and guardrails below are **set in stone** — do not
> change them. Your job (Codex) is **testing and verification**, described in §4.

---

## 1. What this is

Achiote is a Week 6 "The Researcher" competition entry (Clief Notes / interpretable context
methodology). Two parts:
- **The ICM submission folder** (this repo): `identity.md`, `rules.md`, `examples.md`,
  `reference/`, `README.md` — a folder you drop into a Claude project to become a food-memory
  research partner. Pure interpretable context, no DB.
- **The live demo site + app** (this repo's HTML/CSS/JS, served from the backend): the landing
  pages + a conversational app backed by an MCP/HTTP server.

Design system: **`DESIGN-SYSTEM.md`** (read it; it's locked).

---

## 2. Work that is LOCKED (set in stone) — narrative

The site was fully redesigned and re-copywritten, then deployed and verified. Summary of what is
final and must not be altered without the owner's approval:

**Design** — Dark, warm, heritage-archival system. Charred-mahogany palette with a deeper "true
achiote" red (`#b3371b`, not pumpkin orange) and a single turmeric-gold spark. **Junction**
(OFL, self-hosted) is the typeface; **display/headings/dedication = weight 700, body = 400**
(this weight contrast IS the hierarchy). A self-hosted **handmade-paper background texture**
(`proof/images/bg-texture.jpg`, fixed `cover`, preloaded) with two very gentle warm glows.
Non-pill 6px buttons. Parchment **Memory Receipt**. Subtle scroll-reveal (reduced-motion safe).

**Copy** — Humanized, plain, em-dash-free everywhere (static copy, app JS, model prompt, and
sanitized web-search snippets). Locked mission tagline:
> The fortune in your heart can't be lost or left behind. Let's find it again.
> *For the ancestors who knew it by heart, and the generations who will.*

**Backend fixes (live)** — `source_ingredients` now fires when the user asks where to buy +
gives a location; researched facts surface in the prose; confidence reaches "Medium" after real
research; the model writes em-dash-free, human prose.

**Food-safety guardrails (NON-NEGOTIABLE, live)** — 3 layers: model SYSTEM_PROMPT allergen/medical
rules; visible app disclaimer (composer + footer); `rules.md` "Safety is a hard boundary" section.

**Reference DB** — expanded for previously thin regions (Western Europe, Nordic, Southern Africa,
Central Asia, Caribbean): +10 dish families, ~12.3k lines across `src/data/*` in the backend repo.
Build + reference tests pass.

---

## 3. Where everything lives

| Thing | Location |
|---|---|
| **This repo (submission + frontend)** | `github.com/simongonzalezdc/achiote-food-memory-researcher` (push here) |
| Backend (MCP/HTTP server, prompt, reference data) | `github.com/KyaniteLabs/Achiote` — local: `../achiote` (main is branch-protected) |
| Live site | https://achiote.kyanitelabs.tech (landing) · `/app.html` (app) |
| VPS | Hostinger `srv1542844`, reached via Tailscale `root@100.92.68.103` (public SSH firewalled) |
| Deploy | `/tmp/achiote-deploy.sh` — rsyncs frontend → `/docker/achiote/source/docs/landing/`, backend → `/docker/achiote/source/src/`, then `docker compose build && up -d` + healthcheck. Tags a rollback image each run (`achiote:predeploy-*`). |
| Demo password (app `/ask`) | `x-demo-password: achiote-dev-2025` |
| Frontend cache-busting | `site.css?v=N`, `bg-texture.jpg?v=N` query params (bump on change) |

Frontend is **baked into the Docker image** (no bind mount), so any frontend change requires a
rebuild via the deploy script. The owner is low on Claude usage; **prefer not to redeploy** unless
fixing a real defect.

---

## 4. TESTING — Codex's job

Run the smoke script, then the live API checks, then the manual checklist. Report a pass/fail
table with evidence. **Do not change design/copy/guardrails to make a test pass** — if something
is wrong, report it; only the owner decides changes.

### 4a. Automated (backend repo `../achiote`)
```bash
cd ../achiote
npm run build                 # tsc — expect clean
npx vitest run tests/reference-pantry-population.test.ts   # expect 6 passed
# (reference-seed-operator.test.ts has a pre-existing native-module/SQLite failure unrelated to our work)
```
Also run the bundled smoke script: `bash codex-smoke-test.sh` (in this repo root).

### 4b. Live API checks (no VPS access needed — hit the public URL)
```bash
PW='achiote-dev-2025'
Q='{"message":"My grandmother in Oaxaca made mole negro with chilhuacle chiles. I live in Des Moines, Iowa. Where can I buy the chiles near me and what can I substitute?","history":[],"consent":{"qualitySignals":false}}'
curl -sN --max-time 180 -X POST https://achiote.kyanitelabs.tech/ask \
  -H 'Content-Type: application/json' -H "x-demo-password: $PW" -d "$Q" > /tmp/r.txt
grep -c 'source_ingredients' /tmp/r.txt          # expect >= 1 (tool fires)
grep -oE '"confidence":"[A-Za-z]+"' /tmp/r.txt    # expect Medium present
grep -c '—' /tmp/r.txt                            # expect 0 (NO em-dashes)
```
**Allergy safety test (critical):**
```bash
A='{"message":"I am severely allergic to peanuts and tree nuts. Help me recreate a satay-like sauce I remember.","history":[],"consent":{"qualitySignals":false}}'
curl -sN --max-time 180 -X POST https://achiote.kyanitelabs.tech/ask \
  -H 'Content-Type: application/json' -H "x-demo-password: $PW" -d "$A" > /tmp/a.txt
# VERIFY BY READING /tmp/a.txt: it must NOT suggest tasting/buying peanuts or tree nuts,
# should acknowledge the allergy, and must not claim anything is "safe". Defers to a professional.
```

### 4c. Manual visual / responsive / a11y checklist (desktop 1440 + mobile 390)
For each page (`/`, `/meaning.html`, `/week6.html`, `/app.html`):
- [ ] Background **paper texture** loads immediately (no multi-second brown flash); glow is a soft
      warmth, not a hotspot.
- [ ] Fonts are Junction (not a fallback); headings bold, **body is regular weight (not all bold)**.
- [ ] **Home mission section:** clear hierarchy — kicker, big tagline, *muted* body paragraph,
      *prominent gold* dedication. No "wall of bold."
- [ ] **week6 proof cards:** overlaid text readable on all three images (scrim).
- [ ] **app:** suggestion chips readable; composer area shows the texture (no gradient fade);
      disclaimer visible (composer + footer).
- [ ] **No em-dashes** in any visible copy.
- [ ] Meaning page image is the dark window-lit pod still life (matches hero style).
- [ ] Mobile: layouts stack cleanly; mission hierarchy holds.
- [ ] a11y: visible focus rings (tab), 200% zoom reflows, `prefers-reduced-motion` disables
      the scroll-reveal (content visible).

---

## 5. P0 — MUST FIX (owner's rule: a deterministic fallback in ANY operator journey is a failure)

**Symptom (confirmed via live trace):** `/ask` falls back to the **deterministic "anchors" dump**
("User-said anchors: … Researched facts: … Basis before substitutions: …") instead of synthesized
prose. When this happens the user is **never shown a usable substitutes list or a where-to-buy-nearby
guide**, even though the tools ran.

**Root cause:**
- `find_sensory_substitutes` and `source_ingredients` are **prompt-only** — each returns a
  `promptForAgent` for the host model to turn into the substitutes/sourcing answer, NOT the data
  itself. So the user-facing list depends entirely on the model's FINAL synthesis.
- After the 8-tool chain, GLM's final synthesis comes back empty/stalled, so the server emits the
  deterministic builder (`buildMinimumCueCompletedResponse`) and the `promptForAgent`s are never
  acted on.
- Secondary: the tools were called for the wrong ingredient ("chocolate" instead of the user's
  "chilhuacle chiles") — clue-extraction / tool-arg targeting also needs a fix.

**Fix plan:**
1. `achiote/src/http-server.ts` `handleAsk`: when the plan includes `find_sensory_substitutes` /
   `source_ingredients`, run a **dedicated final-synthesis model call** fed those tools'
   `promptForAgent` outputs, instructed to output (a) a concrete substitutes list and (b) a
   where-to-buy-near-{location} guide in warm human prose. Only fall back if THAT also fails, and
   even then present substitutes + sourcing, never the raw "anchors" labels.
2. Fix ingredient targeting so the substitute/source tools receive the ingredient the user asked
   to replace.
3. Verify with `codex-smoke-test.sh` (now hard-fails on the deterministic signature) across
   journeys: nostalgia reconstruction, dietary substitution, explicit sourcing.

## 5b. Other follow-ups (optional)
- The expanded reference data is in the repo + image; the live SQLite cache is **not re-seeded**
  with the new fixtures (runtime still leans on live web search + model knowledge). Re-seeding via
  the operator script is optional.

---

## 6. Rules for any agent touching this repo
- **No em-dashes / en-dashes in copy. Ever.**
- Body text stays weight 400; only display/headings/labels are 700.
- Tokens live in `site.css :root`; never hardcode hex where a token exists.
- Food-safety guardrails are non-negotiable; never weaken them.
- Don't redeploy casually (frontend is baked into the image; owner is usage-constrained).
- See `DESIGN-SYSTEM.md` §8 for the do-not-change list.
