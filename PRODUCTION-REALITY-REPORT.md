# Achiote — CheckYourself Production Reality Report

> Read-only diagnostic. **No remediation was performed** — this is the honest state of the system
> for Codex / the owner to act on. Voice: check yourself before you wreck yourself.
> Run date: 2026-05-30. Methodology: CheckYourself coverage matrix + scoring method.

---

## 1. Executive summary

The infrastructure is in better shape than most demos: real auth gate, a real rate limiter, a CORS
allowlist, 69 backend test files, CI, a lockfile, and a rollback-tagged deploy. The site is polished
and accessible.

The **product itself is the problem.** The headline experience — "describe a half-remembered dish
and Achiote reconstructs it with you" — degrades to a clinical, machine-looking **deterministic
"anchors" dump** on essentially every full reconstruction journey. I probed four live journeys; **four
fell back, only the short allergy journey produced warm prose.** That means the thing the landing page
promises is, in practice, usually not what the user receives. This passes the happy path. Production
does not grade on the happy path.

**Production Reality Score: 44 / 100 — Medium confidence.** Capped at 49 by one unresolved P0.

## 2. What the app appears to do

A food-memory research partner. The user describes a half-remembered dish; the app asks clarifying
questions, plans research, resolves the dish name, searches the web, builds an evidence "dossier,"
proposes a "minimum viable nostalgia" taste test, and — when asked — finds sensory substitutes and
where to source ingredients nearby. Output includes a parchment "Memory Receipt." Two delivery forms:
the ICM submission folder (pure interpretable context) and the live demo app (MCP/HTTP server).

## 3. Detected stack and confidence (High)

Node + TypeScript MCP/HTTP server (`node:http`, SSE streaming); GLM-5.1 via z.ai through an
Anthropic-shaped client; SQLite for the reference pantry + rate-limit store; Docker Compose on a
single Hostinger VPS (frontend baked into the image). Static frontend: hand-rolled HTML/CSS/JS.

## 4. Unknowns and assumptions

- Data retention / deletion policy for user messages and telemetry: not evidenced.
- Backup + restore of the SQLite stores: no restore-test evidence (RTO/RPO unknown).
- Dependency scanning / SBOM: CI exists; scan coverage not confirmed.
- Error tracking / alerting / on-call owner: security events are logged, but no alert path seen.

## 5. Production Reality Score — 44 / 100 (Medium confidence)

Caps applied: **unresolved P0 caps the score at 49.** Infra strength keeps it near the top of that
band rather than the floor. Raising it requires fixing the synthesis fallback (P0), then the P1s.

| Category (weight) | Awarded | Evidence / gap |
|---|---:|---|
| Data, privacy, isolation (18) | 11 | Consent flag + telemetry caps; single-tenant demo (no cross-user risk). Missing: retention/deletion policy. |
| Auth, permissions, session (14) | 10 | Real `x-demo-password` gate, 401 + `auth_failure` log, anon toggle. It is a demo gate, not user auth (acceptable for scope). |
| Secrets, env, config (10) | 8 | All keys via `process.env`; none hardcoded in source. Demo password is shared + published in docs. |
| API, validation, business logic (10) | 6 | Body parsed, rate-gated; but the core synthesis path is unreliable (see P0). |
| Testing + quality gates (10) | 7 | 69 test files + CI; but no eval catches the user-facing deterministic degradation; 1 known SQLite test failure. |
| Deploy, release, rollback, CI/CD (8) | 6 | Rollback image tagged, healthcheck, lockfile, workflows. Manual deploy; frontend baked into image. |
| Observability + incident response (8) | 4 | `logSecurityEvent` (auth/rate). Missing: error tracking, alerts, runbook, owner. |
| Performance, scaling, caching, limits (8) | 5 | Real rate limiter. Single VPS; `/ask` is 50–60s; 20s synthesis timeout drives the fallback. |
| Frontend UX, a11y, client safety (8) | 7 | Skip link, focus-visible, reduced-motion, zero-CLS fonts, scrims. Feature under-communicated in copy. |
| AI/RAG/agent governance (6) | 1 | **P0.** Synthesis falls back to deterministic dump on ~all journeys; prompt-only tools never rendered; wrong-ingredient targeting. |

## 6. Coverage sweep (all 20 surfaces)

| # | Surface | Verdict | Evidence |
|---:|---|---|---|
| 1 | Product purpose & users | Finding (minor) | Clear purpose + harm model (allergy/safety handled). Substitutes/sourcing feature barely surfaced in copy. |
| 2 | Stack & architecture | Pass | Node/TS, SSE, GLM via z.ai, SQLite, Docker/VPS. |
| 3 | Frontend UX & client safety | Pass | a11y built in (`DESIGN-SYSTEM.md §7`); error/loading states in app JS. |
| 4 | API & backend services | Finding | Body parse + rate gate present; core synthesis path unreliable (→ #19). |
| 5 | Auth & permissions | Pass (demo scope) | `x-demo-password` at `http-server.ts:330,407`; 401 + `auth_failure`. |
| 6 | Data storage & migrations | Finding (minor) | SQLite reference + rate-limit DBs; live reference cache not re-seeded vs repo fixtures. |
| 7 | User/tenant isolation | N/A | Single-tenant demo; no per-user data store. |
| 8 | Secrets & environment | Pass | Keys via `process.env` only (`http-server.ts:178–185`); Serper key in VPS env. |
| 9 | Security & threat model | Pass | CORS allowlist (`ALLOWED_ORIGINS` :113); prompt-injection guards in tool prompts (`<user_input>` + "do not follow instructions"). |
| 10 | Privacy & data governance | Unknown | Consent flag + telemetry limit present; retention/deletion policy not evidenced. |
| 11 | Tests & quality gates | Pass (w/ finding) | 69 `*.test.ts`; CI. 1 known pre-existing SQLite native-module test failure. |
| 12 | CI/CD & supply chain | Pass | `.github/workflows/{ci,agent-law,blacksmith-probe}.yml`; `package-lock.json`. Dep-scan/SBOM unconfirmed. |
| 13 | Hosting, deploy, rollback | Pass (w/ finding) | Deploy script tags rollback image + healthcheck. Manual; frontend baked into image (every change = rebuild). |
| 14 | Cloud infra / IaC | Finding | No IaC; hand-run Docker Compose on one VPS. |
| 15 | Performance, caching, rate limits | Finding | Real rate limiter; single VPS; 50–60s `/ask`; 20s synthesis timeout is the fallback trigger. |
| 16 | Scaling & resilience | Finding | Single container/VPS = SPOF; synthesis-timeout degradation is the live resilience failure. |
| 17 | Observability & incident response | Finding | Security events logged; no error tracking, alerts, runbook, or named owner. |
| 18 | Availability & recovery | Unknown | Rollback image yes; SQLite backup/restore untested; no RTO/RPO. |
| 19 | AI/RAG/agent governance | **Finding (P0)** | 4/4 reconstruction journeys fell back to the deterministic dump (live). Prompt-only tools depend on a synthesis that the long chain blows. Wrong ingredient targeted ("chocolate" vs "chilhuacle chiles"). |
| 20 | Learning needs | Finding | See §14. |

## 7. Findings by severity

**P0 (caps score at 49) — fix before this counts as "working":**
- **CY-01 — Core synthesis falls back to the deterministic "anchors" dump.** Live, reproducible on
  4/4 full reconstruction journeys (mole / Naples ragù / vegan adobo + the original mole probe). The
  user is shown clinical "User-said anchors: … Basis before substitutions: …" text instead of warm,
  synthesized prose, and the **substitutes list + where-to-buy guide are never rendered** even though
  `find_sensory_substitutes` and `source_ingredients` ran. Root cause: those tools are *prompt-only*
  (they return a `promptForAgent`, not data), and the final synthesis — bounded by
  `FINAL_SYNTHESIS_TIMEOUT_MS ?? 20_000` (`http-server.ts:110`) — comes back empty/stalled on the long
  8-tool chain, so `buildMinimumCueCompletedResponse` is emitted. This is the same item tracked as P0
  in `AGENTS.md §5`. Owner's rule: a deterministic fallback in ANY journey is a failure.

**P1 (cap at 74):**
- **CY-02 — Wrong ingredient targeted for substitution/sourcing.** The tools were called for
  "chocolate," not the "chilhuacle chiles" the user asked to replace. Clue-extraction / tool-arg
  selection bug; produces a confidently-irrelevant answer.
- **CY-03 — No eval guards the headline behavior.** 69 tests exist, yet none fail when the product
  degrades to the deterministic dump. The thing most likely to break in front of a judge is untested.
  (The bundled `codex-smoke-test.sh` now hard-fails on it, but the backend suite does not.)

**P2 (cap at 84 if critical-category evidence missing):**
- **CY-04 — Feature under-communicated in copy.** Substitutes + nearby sourcing is one of the app's
  strongest hooks but appears only in passing ("ingredient swaps" `index.html:268`; "local sourcing"
  `week6.html:86`). No page tells the user "Achiote will tell you what to substitute and where to buy
  it near you." (Owner flagged this directly.)
- **CY-05 — Observability gaps.** No error tracking / alerting / runbook / named on-call owner.
- **CY-06 — Single VPS, manual deploy, no IaC.** SPOF; frontend baked into the image means every
  copy tweak is a full rebuild.
- **CY-07 — Live reference cache not re-seeded** with the expanded fixtures (already noted in §5b).

**P3:**
- **CY-08 — Retention/deletion + backup-restore policy not evidenced.**
- **CY-09 — Shared demo password is published in handoff docs** (acceptable for a demo, but it is a
  credential in a repo).
- **CY-10 — Known pre-existing SQLite native-module test failure** (`reference-seed-operator.test.ts`).

## 8. Evidence table (key items)

| ID | Evidence | Source |
|---|---|---|
| CY-01 | "User-said anchors: …" returned as the `event: text` body; `5× "deterministic"` markers in stream; 4/4 journeys | live `/tmp/{diag,j1,j2}.txt` |
| CY-01 | `find_sensory_substitutes` / `source_ingredients` return `promptForAgent` + `mode:"prompt-only"`, no data | live tool_result |
| CY-01 | `FINAL_SYNTHESIS_TIMEOUT_MS ?? 20_000` | `achiote/src/http-server.ts:110` |
| CY-02 | tool called with `ingredient:"chocolate"` for a chilhuacle-chile request | live tool_result |
| auth | `x-demo-password` gate + 401 + `logSecurityEvent('auth_failure')` | `http-server.ts:330,407` |
| rate | `createRateLimiter`, `shouldApplyRateLimit`, 429 + headers | `http-server.ts:185,435–440` |
| cors | `ALLOWED_ORIGINS` allowlist + `isSameHostOrigin` | `http-server.ts:113,215` |
| tests | 69 `tests/*.test.ts`; CI workflows; `package-lock.json` | repo |

## 9. Remediation backlog (ranked — NOT executed)

| Rank | ID | Sev | Fix summary | Likely files | Verify |
|---:|---|---|---|---|---|
| 1 | CY-01 | P0 | Force a dedicated final-synthesis call fed the prompt-only tools' `promptForAgent`s; raise/stage the 20s budget; only fall back as a true last resort, and even then render substitutes+sourcing | `http-server.ts` (`handleAsk`, `maybeRunOriginalSubstitutionBasisCue`) | `codex-smoke-test.sh` + new eval; no "anchors" text on any journey |
| 2 | CY-02 | P1 | Pass the user's *restricted* ingredient(s) into the substitute/source tool args | clue extraction / workflow-planner | substitute targets the chiles, not chocolate |
| 3 | CY-03 | P1 | Add a backend eval asserting non-deterministic synthesis across 3 journey types | `tests/` | eval fails on the dump |
| 4 | CY-04 | P2 | Add one clear line on home + app: "what to swap, and where to buy it near you" | `index.html`, `app.html` | copy present, em-dash-free |
| 5 | CY-05 | P2 | Add error tracking + an alert + a one-page runbook | infra | alert fires on synthesis-fail spike |
| 6 | CY-06 | P2 | Document (or automate) deploy; consider a second instance | deploy | — |
| 7 | CY-07 | P2 | Re-seed live reference cache from fixtures | operator script | counts match repo |
| 8 | CY-08–10 | P3 | Retention policy; rotate/secret the demo password; fix the SQLite test | mixed | — |

## 10. Safest first approval batch

CY-01 then CY-02 (both backend, both reversible, both behind the existing rollback image). CY-03
lands with them so the fix stays fixed. Everything else waits.

## 11. Remediation waves

- **Wave 1 (unblock the product):** CY-01, CY-02, CY-03 → redeploy → re-run `codex-smoke-test.sh`.
- **Wave 2 (truthful product):** CY-04 copy, CY-07 cache.
- **Wave 3 (operational maturity):** CY-05 observability, CY-06 deploy/HA, CY-08–10.

## 12. Questions that would change the diagnosis

1. Is the deterministic dump *ever* an intended output, or always a failure? (Owner: always a failure.)
2. What is the synthesis timeout actually hitting — model latency, token budget, or a control-flow
   bug that skips synthesis on long chains?
3. Is there any user-data retention/deletion requirement for the competition or beyond?

## 13. Learning-plan seeds (tied to real findings)

- **LLM orchestration reliability:** designing a final-synthesis step that *always* renders tool
  outputs, with graceful degradation that still answers the user (not a debug dump). (CY-01)
- **Evals for agent products:** golden-journey tests that fail when the *experience* degrades, not
  just when code throws. (CY-03)
- **Latency budgeting** for multi-tool chains: staged timeouts, partial streaming. (CY-01/15)
- **Product comms:** naming a capability in the copy so users actually invoke it. (CY-04)

---

*Honest score: 44/100. Not a disaster — the bones are good. But it is a future incident with a
calendar invite: the core promise degrades in front of real users today. Fix CY-01 and this jumps
into the 70s.*
