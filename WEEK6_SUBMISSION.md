# Week 6 Submission - Achiote Food Memory Researcher

This is the Week 6 "The Researcher" submission guide.

## Start here

The folder-based researcher is this repository:

```text
README.md
identity.md
rules.md
examples.md
reference/
```

Drop that folder into a model workspace that supports project files or persistent instructions. The model becomes Achiote: a food-memory researcher that reconstructs half-remembered family foods and drinks from sound-alikes, sensory clues, language fragments, source research, and local ingredient access.

## What it is useful for

Achiote is most useful when the user does not know the dish name, cannot spell the original language, remembers only a texture or smell, or cannot access the original ingredients where they live now.

It teaches the host model to investigate before answering:

1. collect the memory fragment;
2. assess whether the memory is specific enough;
3. ask only 0-3 high-value clarifying questions when needed;
4. research names, regions, techniques, and sensory mechanisms;
5. weigh source quality and uncertainty;
6. separate user-said, researched, inferred, and unknown evidence;
7. find the most accessible local ingredient path;
8. produce one minimum viable nostalgia cue before any full recipe.

## Why this is not just a recipe prompt

A summarizer turns a memory into a plausible dish guess. Achiote turns it into an investigation:

- rough family words stay visible as evidence;
- language preference is detected or asked;
- sources are weighted by what they can prove;
- exact specialty ingredients are not the first move;
- local access and substitutes are part of the research;
- the first concrete output is a tiny cue, not a full recipe.

## Five-minute test

1. Upload `achiote-food-memory-researcher/` to Claude Projects, ChatGPT Projects/custom GPT knowledge, Gemini Gems, Codex, or another model workspace that can read attached files.
2. In the project/system instructions, say: "Read `README.md`, then `identity.md`, then `rules.md`, then the relevant files in `reference/`, then mirror `examples.md`."
3. If the platform has web/search tools, enable them. If it does not, Achiote should still run the structured workflow while marking unverifiable claims as unknown.
4. Paste:

```text
My mom said my Puerto Rican grandma made something that sounded like "pass-teh-lay."
I do not speak Spanish. Maybe plantains or pork? It smelled savory and was wrapped in something.
I live near Orlando.
```

Expected behavior:

- Achiote should not jump straight to a recipe.
- It should preserve "pass-teh-lay" as a sound-alike clue.
- It should form and qualify a hypothesis.
- It should identify what to research.
- It should separate evidence from inference.
- It should offer a cheap local first cue before specialty shopping.

## Existing proof surfaces

The live Achiote product proves the same workflow as a working app:

- Live site: https://achiote.kyanitelabs.tech/
- Week 6 proof page: https://achiote.kyanitelabs.tech/week6
- Live app: https://achiote.kyanitelabs.tech/app
- Sample artifact in this repo: `proof/sample-reconstruction-artifact.md`

Those are proof surfaces, not replacements for the folder. The Week 6 folder is the researcher brain. The existing app/server proves that the workflow has already been implemented as a structured MCP/HTTP product.

## Public proof surface

The portable proof page included in this repo is:

```text
proof/week6.html
```

It links the folder idea, live app journey, Memory Receipt, and proof story in one judge-friendly surface.
