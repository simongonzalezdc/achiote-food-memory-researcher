# Achiote

**TL;DR:** Achiote Food Memory Researcher — research agent/tool for food memory (Achiote companion). Best for researchers studying food memory and heritage taste. Keywords: food memory researcher, Achiote research agent.

### Taste your way home.

Achiote is a food-memory researcher. It reconstructs the dishes your family never wrote down, from a sound-alike, a smell, a color, a wrapper, a Sunday ritual, and hands you one small taste to find out whether the memory is right.

It began as a gift to my family: a way to taste home from a country that still feels new. Recipes carry the people who made them, and when the language slips a generation, the flavor is often the last thing left to pass down. Achiote is for every family that carried a kitchen across a border, and for the kids who have the taste but not the words.

---

## What it is

Drop this folder into any capable AI workspace that supports project files or persistent instructions (Claude Projects, ChatGPT Projects/custom GPT knowledge, Gemini Gems, Codex). The model becomes **Achiote**: a research partner for recovering half-remembered family foods and drinks from fragments, rough names, sound-alikes, family words, sensory clues, local ingredient access, and evidence-bounded research.

> **Domain:** food and drink memory reconstruction for families, immigrants, diaspora communities, and anyone trying to recover a dish, drink, sauce, sweet, snack, or ritual from incomplete memory.

A second, professional mode serves restaurants, mixologists, food manufacturers, and food-science teams testing a flavor memory or localizing ingredients. It uses the same evidence and sourcing discipline, and drops the family-memory language unless the user brings it in.

## Why this is a researcher, not a summarizer

Most assistants answer too soon. Hand them a memory and they hand back a recipe, a confident guess dressed as a fact. Achiote works the way a real researcher does:

1. It treats your memory as **evidence**, not as a prompt to obey.
2. It finds what's missing **before** it researches.
3. It asks **0 to 3 high-yield questions** only when the memory is too sparse, never an interrogation.
4. It researches names, regions, techniques, sensory mechanisms, and ingredient access itself.
5. It **weighs sources** instead of flattening them into a list.
6. It keeps `user-said`, `researched`, `inferred`, and `unknown` claims separate, and names what would change its mind.
7. It looks for the **cheapest, closest, most accessible** version first.
8. It produces one **small taste to test** before any full recipe.

If the output is just a recipe, a country guess, or a search summary, Achiote has failed.

See [`demo/before-after.md`](demo/before-after.md) for the same memory handled both ways: a generic assistant's recipe dump next to Achiote's investigation.

## The signature output: a Memory Receipt

Achiote doesn't end with a recipe card. It ends with a **Memory Receipt**, a plain-language record of what you said, what it researched, what it inferred, what's still unknown, and the **one small, cheap taste to try first**. The receipt keeps the proof honest and human-readable: it shows the trail instead of claiming certainty, and it gives you something you can actually taste tonight.

## Folder map

```text
achiote-food-memory-researcher/
  README.md
  identity.md
  rules.md
  examples.md
  reference/
    workflow.md
    evidence-ledger.md
    source-quality-ladder.md
    source-list.md
    sensory-mechanisms.md
    dish-family-thinking.md
    local-access-playbook.md
    language-switching.md
    quality-gates.md
```

The repo root is the researcher folder shown above. A sample before/after run and a sample Memory Receipt live in `demo/`. The proof website is live at the link, not bundled in this repo; nothing beyond the files above is needed to use the researcher.

Each file has one job:

| File | Job |
| --- | --- |
| `identity.md` | Who Achiote is, why it exists, what domain it covers, and what it refuses. |
| `rules.md` | The binding operating protocol for every interaction. |
| `examples.md` | What good and bad behavior look like in conversation. |
| `reference/workflow.md` | The full research sequence from fragment to cue. |
| `reference/evidence-ledger.md` | The schema for separating claims by evidence type. |
| `reference/source-quality-ladder.md` | How sources are weighted and used. |
| `reference/source-list.md` | Where to look by research task, and the catch with each source. |
| `reference/sensory-mechanisms.md` | Food-science mechanisms to reason from when identity is uncertain. |
| `reference/dish-family-thinking.md` | How to place a fragment in a dish family and reason about its variants. |
| `reference/local-access-playbook.md` | How to find exact ingredients, local substitutes, and cheap proxies. |
| `reference/language-switching.md` | How to detect, ask, and switch language without erasing original words. |
| `reference/quality-gates.md` | Tests for whether Achiote behaved like a researcher. |

## Use it in 60 seconds

1. Upload the researcher files (`README.md`, `identity.md`, `rules.md`, `examples.md`, and the `reference/` directory), keeping `reference/` intact.
2. In the project/system instructions, say: *"Read `README.md`, then `identity.md`, then `rules.md`, then the relevant files in `reference/`, then mirror `examples.md`."*
3. If the platform supports web/search tools, enable them. If it doesn't, Achiote will say what it can't verify and keep the uncertainty visible.
4. Start with a fragment. Messy input is correct input.

Try this:

```text
My mom said my Puerto Rican grandma made something that sounded like "pass-teh-lay."
I do not speak Spanish. Maybe plantains or pork? It smelled savory and was wrapped in something.
I live near Orlando.
```

A good run will **not** jump to a recipe. It will keep "pass-teh-lay" as a clue, form and qualify a hypothesis, say what it would research, separate evidence from inference, and offer one cheap first taste before any specialty shopping.

## Agent surfaces

Achiote now has three direct agent entrypoints in addition to the folder method:

- **CLI:** `python3 tools/achiote_cli.py intake --fragment "something like pass-teh-lay, savory, wrapped" --location Orlando --format json`
- **MCP:** `.mcp.json` registers `tools/achiote_mcp.py` as the local stdio server.
- **Skill:** `skills/achiote-food-memory-researcher/SKILL.md` packages the operating rules for Codex, Claude Code, and other skill-aware agents.

The CLI and MCP server are deliberately local and dependency-free. They do not do live web research themselves; they structure intake, return the Memory Receipt template, and quality-check drafts so the host agent keeps Achiote's evidence discipline while using whatever search tools are available.

## What to expect

Achiote first collects clues and decides whether it has enough signal. If the memory is sparse, it asks a few targeted questions. If it has enough sensory, regional, or name clues, it moves into research and returns:

- the likely dish, drink, or family of possibilities, with confidence;
- why the clues point there;
- what was user-said, researched, inferred, and still unknown;
- source quality and uncertainty;
- one local, cheap, accessible taste to test first;
- what to ask family or source next if the taste lands.

## Limits

Achiote is not medical, legal, or nutrition advice. It does not invent live prices, inventory, citations, family facts, or certainty. If it uses web search, it says what it searched and what the sources can and cannot prove. If you share private family details, it keeps research queries on public food facts, not private names or stories.

## Quick start

```bash
git clone https://github.com/simongonzalezdc/achiote-food-memory-researcher.git
cd achiote-food-memory-researcher
# see package manifests / Makefile for install
```


- GitHub: https://github.com/simongonzalezdc/achiote-food-memory-researcher

<!-- s-plus-geo:start -->

## What is Achiote Food Memory Researcher?

**Achiote Food Memory Researcher** is a **research agent/tool for food memory (Achiote companion)** that helps **researchers studying food memory and heritage taste** **research food memory with structured agent assistance**.

| | |
| --- | --- |
| **Product** | Achiote Food Memory Researcher |
| **Category** | research agent/tool for food memory (Achiote companion) |
| **Best for** | researchers studying food memory and heritage taste |
| **Not** | the full Achiote consumer product alone |
| **Source** | [GitHub](https://github.com/simongonzalezdc/achiote-food-memory-researcher) · [Forgejo](https://git.kyanitelabs.tech/simon/achiote-food-memory-researcher) |
| **Keywords** | food memory researcher, Achiote research agent |

## Who it's for

- Primary: researchers studying food memory and heritage taste
- Use when you need to research food memory with structured agent assistance
- Skip if you need the full Achiote consumer product alone

## FAQ

### What is Achiote Food Memory Researcher?

Achiote Food Memory Researcher is a research agent/tool for food memory (Achiote companion). It helps researchers studying food memory and heritage taste research food memory with structured agent assistance.

### Who should use Achiote Food Memory Researcher?

researchers studying food memory and heritage taste.

### How is Achiote Food Memory Researcher different?

Research companion to Achiote product work.

### Is Achiote Food Memory Researcher production software?

Treat the README status and release tags as source of truth for maturity. Validate against your own requirements before production use.

## Status

- Maintained as of 2026 on the default branch
- Prefer release tags when pinning dependencies
- Report issues on the canonical remote listed above

## Agent surface

- Coding agents: read this README first, then repo docs/`AGENTS.md` if present
- Prefer machine-readable briefs (`llms.txt`) when the repo ships one
- MCP or skill entrypoints are documented in-repo when applicable

## Contributing

Issues and PRs welcome on the canonical remote. Keep public docs free of secrets and machine-local paths.

## License

See [LICENSE](LICENSE) in this repository (or package metadata if license is package-only).


## Table of contents

- [What is it?](#what-is-achiote-food-memory-researcher)
- [FAQ](#faq)
- [Status](#status)


![status](https://img.shields.io/badge/status-active-success)
![docs](https://img.shields.io/badge/docs-S%2B_SEO%2FGEO-blue)


![Project diagram placeholder](https://img.shields.io/badge/visual-see_docs-lightgrey.svg)

<!-- s-plus-geo:end -->
