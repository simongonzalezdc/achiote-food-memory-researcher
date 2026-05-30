# Achiote — Demo Video Script

A 75-second walkthrough for the Week 6 submission. Authored with the Kyanite
script-to-animation methodology (stage contracts, hook families, retention beats,
explicit metadata, vertical-first) and built/packaged with **mcp-video**.

> No process leak: this script never references the internal "north-star" example
> used in planning. The feeling is shown, never explained.

---

## Metadata header

| Field | Value |
| --- | --- |
| Pillar | Build-in-public · ICM product demo |
| Hook type | Semantic paradox ("the recipe was never written down — the memory was") |
| Template | Layered reveal |
| Target duration | 75s (hard cap 90s) |
| Platforms | Vertical-first 9:16 (Reels/Shorts/TikTok) → 16:9 adapt for the Skool post |
| Value slots | 1) what it is · 2) researcher-not-summarizer · 3) live Memory Receipt · 4) why it matters |

---

## Stage contract

1. **Script** — this file (locked copy below).
2. **Capture** — screen-record the live app at `achiote.kyanitelabs.tech/app` running one real reconstruction end-to-end; record voiceover from the VO column.
3. **Build/render** — `demo/build_video.py` (mcp-video) trims, adds text beats, resizes per platform.
4. **Package** — export 9:16 master + 16:9 adapt; thumbnail at the receipt reveal.

**Audit checks before publish (from the methodology):**
- [ ] Hook lands in the first 2–3 seconds.
- [ ] No dead zone longer than 5s without a retention beat.
- [ ] Close gives a shareable takeaway.
- [ ] The app shown is the real, working app (no mockups).

---

## Shot list & locked copy

Timecodes are targets. **VO** = voiceover. **TEXT** = on-screen text beat. **SCREEN** = what we capture.

| # | Time | SCREEN | VO | TEXT (retention beat) |
|---|------|--------|----|----|
| 1 | 0:00–0:04 | Black → the word *Achiote* fades in over the hero | — | **"The recipe was never written down."** |
| 2 | 0:04–0:08 | Hero: "Taste your way home" | "Every family has a dish nobody wrote down." | **"The memory was."** |
| 3 | 0:08–0:16 | Cut to `/app`, empty input | "Most AI hands you a recipe — a confident guess. Achiote does the opposite." | "Not a summarizer." |
| 4 | 0:16–0:24 | Type a real fragment: *"sounded like pass-teh-lay, savory, wrapped in a leaf, near Orlando"* | "You give it a fragment. A sound. A smell. A color." | "Messy input is correct input." |
| 5 | 0:24–0:33 | Click Reconstruct → the trace runs (weighing evidence) | "It investigates — weighs sources, keeps your words, marks what it can't prove." | "Investigates, then proves." |
| 6 | 0:33–0:48 | The **Memory Receipt** renders: said / researched / inferred / unknown | "Then it hands back a Memory Receipt: what you said, what it found, what's still unknown." | "Evidence, not a guess." |
| 7 | 0:48–0:58 | Highlight the **First taste** line | "And one small taste to try tonight — before any specialty shopping." | "One small taste." |
| 8 | 0:58–1:08 | Scroll the folder map / README | "The whole researcher is a folder. Drop it into any model. It becomes Achiote." | "Folder = researcher. ICM." |
| 9 | 1:08–1:15 | Back to hero, logo | "For everyone who carried a kitchen across a border." | **"Bring a memory back to the table."** + URL |

---

## Voiceover (clean read, ~150 words)

> Every family has a dish nobody wrote down.
> Most AI hands you a recipe — a confident guess. Achiote does the opposite.
> You give it a fragment. A sound. A smell. A color.
> It investigates — weighs sources, keeps your words, and marks what it can't prove.
> Then it hands back a Memory Receipt: what you said, what it found, and what's still unknown.
> And one small taste to try tonight, before any specialty shopping.
> The whole researcher is a folder. Drop it into any model, and it becomes Achiote.
> For everyone who carried a kitchen across a border —
> bring a memory back to the table.

---

## Hook alternates (A/B; pick by gut on the day)

- **Semantic paradox (default):** "The recipe was never written down. The memory was."
- **Impossible question:** "How do you cook a dish you only half remember?"
- **Bold claim:** "This isn't a recipe bot. It's a researcher that refuses to guess."
- **Ritual entry:** "A grandmother's kitchen, one sound-alike, and a question no recipe site can answer."

---

## Close / caption (for the Skool + LinkedIn post)

> Built **Achiote** for Week 6 — a folder-based food-memory researcher (ICM).
> It investigates instead of guessing: weighs sources, separates evidence from
> inference, and ends with one small taste to test the memory. Live + working.
> 🔗 achiote.kyanitelabs.tech
