# Achiote

**A food-memory researcher that reconstructs half-remembered family dishes from fragments, smells, sounds, and rituals, then hands you one small taste to find out if the memory is right.**

Achiote is an AI research partner for recovering foods, drinks, sauces, sweets, snacks, and rituals that your family never wrote down. It treats your memory as evidence, not a prompt, and works through a rigorous investigation before suggesting anything to taste.

It began as a personal gift: a way to taste home from a country that still feels new. Recipes carry the people who made them, and when language slips a generation, flavor is often the last thing left to pass down.

---

## Features

- **Evidence-bounded research** — Treats your memory as a clue, not a command. Separates what you said, what it researched, what it inferred, and what’s still unknown.
- **Smart interrogation** — Asks 0–3 targeted questions only when the memory is too sparse, never an interrogation.
- **Source-weighted analysis** — Weighs and cites sources instead of flattening them into a list.
- **Sensory-first approach** — Uses food science (flavor chemistry, texture mechanisms, regional techniques) to reason from incomplete clues.
- **Local accessibility** — Looks for the cheapest, closest, most available ingredients and techniques first.
- **Memory Receipt output** — Produces a plain-language proof trail and one small, cheap taste to test before any full recipe.
- **Dual-mode operation** — Serves both personal/family memory recovery and professional food science contexts with the same evidence discipline.
- **Agent-ready** — Works as a folder of instructions in any capable AI workspace, or via dedicated CLI, MCP, and skill interfaces.

---

## Installation

### Prerequisites

- Python 3.8+ (for the CLI/MCP tools)
- An AI workspace that supports project files or persistent instructions (Claude Projects, ChatGPT Projects/custom GPT knowledge, Gemini Gems, Codex, etc.)

### Option 1: Use as AI Workspace Instructions

Clone or download this repository and upload the entire folder to your chosen AI platform. In your project or system instructions, direct the model to read the files:

```text
Read README.md, then identity.md, then rules.md, then the relevant files in reference/, then mirror examples.md.
```

### Option 2: Install the Python Tools (CLI/MCP)

```bash
git clone https://github.com/simon/achiote-food-memory-researcher.git
cd achiote-food-memory-researcher
```

The tools are dependency-free (standard library only). To verify:

```bash
python3 tools/achiote_cli.py --help
```

For MCP server integration, see the `.mcp.json` configuration in the repository root.

---

## Quick Start

1. **Choose your interface**: Use the folder method, CLI, MCP, or skill.
2. **Start with a fragment**: Describe your memory in any messy, incomplete way. This is the correct input.
3. **Let Achiote research**: It will ask clarifying questions only if necessary, then investigate.
4. **Receive a Memory Receipt**: Get a proof trail and one small taste to try first.

### Try this example fragment:

```text
My mom said my Puerto Rican grandma made something that sounded like "pass-teh-lay."
I do not speak Spanish. Maybe plantains or pork? It smelled savory and was wrapped in something.
I live near Orlando.
```

Achiote will not jump to a recipe. It will keep "pass-teh-lay" as a clue, form and qualify a hypothesis, say what it would research, separate evidence from inference, and offer one cheap first taste.

---

## Usage

### As an AI Workspace Folder

The repository root is designed to be the entire researcher. Upload all files to your AI workspace and instruct the model to follow the methodology.

**Key files and their roles:**

| File | Purpose |
|------|---------|
| `identity.md` | Who Achiote is, why it exists, domain coverage, and boundaries. |
| `rules.md` | The binding operating protocol for every interaction. |
| `examples.md` | Good and bad behavior examples in conversation. |
| `reference/workflow.md` | The full research sequence from fragment to cue. |
| `reference/evidence-ledger.md` | Schema for separating claims by evidence type. |
| `reference/source-quality-ladder.md` | How sources are weighted and used. |
| `reference/source-list.md` | Where to look by research task and the limitations of each source. |
| `reference/sensory-mechanisms.md` | Food science mechanisms for reasoning from uncertain identity. |
| `reference/dish-family-thinking.md` | How to place a fragment in a dish family and reason about variants. |
| `reference/local-access-playbook.md` | How to find exact ingredients, local substitutes, and cheap proxies. |
| `reference/language-switching.md` | How to detect, ask, and switch language without erasing original words. |
| `reference/quality-gates.md` | Tests for whether Achiote behaved like a researcher. |

### Using the CLI

The CLI structures intake and returns a Memory Receipt template.

```bash
# Basic intake
python3 tools/achiote_cli.py intake \
  --fragment "something like pass-teh-lay, savory, wrapped" \
  --location Orlando

# With JSON output
python3 tools/achiote_cli.py intake \
  --fragment "red sauce, smoky, used for dipping" \
  --format json

# Check a draft Memory Receipt against quality gates
python3 tools/achiote_cli.py check-quality \
  --receipt-file draft-receipt.md
```

### Using the MCP Server

The `.mcp.json` file registers `tools/achiote_mcp.py` as a local stdio server for MCP-compatible agents. Point your agent to this configuration to give it Achiote's intake and quality-checking tools.

### Using the Skill Package

The `skills/achiote-food-memory-researcher/SKILL.md` file packages the operating rules for skill-aware agents like Codex or Claude Code.

### What to Expect in a Session

1. **Intake and signal assessment**: Achiote collects clues and decides if it has enough to research.
2. **Targeted clarification** (if needed): Asks 0–3 high-yield questions only when the memory is too sparse.
3. **Research and evidence compilation**: Investigates names, regions, techniques, sensory mechanisms, and ingredient access.
4. **Memory Receipt delivery**: Outputs the likely dish/drink, confidence level, evidence trail, source quality, and one accessible taste to test first.

---

## FAQ

**Q: Does Achiote just give me a recipe?**
A: No. If the output is just a recipe, Achiote has failed. It always starts with a small, cheap taste to test the memory first, and it shows you its reasoning trail.

**Q: What if my memory is very vague?**
A: Achiote is designed for vague, incomplete memories. It will ask a few targeted questions only if it doesn't have enough to work with. Messy input is correct input.

**Q: Can I use this for professional food development?**
A: Yes. Achiote has a professional mode for restaurants, mixologists, food manufacturers, and food-science teams. It uses the same evidence discipline but drops the family-memory language unless you bring it in.

**Q: How does Achiote handle ingredients I can't find locally?**
A: It prioritizes local accessibility. The `reference/local-access-playbook.md` guides it to find the closest, cheapest substitutes available in your area.

**Q: Is my private family information safe?**
A: Achiote keeps research queries on public food facts, not private names or stories. It does not invent or use private details for external searches.

**Q: What if Achiote makes a mistake?**
A: The Memory Receipt is designed to show its work. You can see what it considered user-said, researched, inferred, and unknown. It names what would change its mind. This makes errors visible and correctable.

---

## Contributing

Contributions are welcome! This is a research project, and improvements to the methodology, tools, or documentation are valuable.

### How to Contribute

1. **Fork the repository** and create a new branch for your feature or fix.
2. **Follow the existing patterns** — The project is structured with clear separation between identity, rules, examples, and reference materials.
3. **Test your changes** — If modifying the CLI/MCP tools, test them with sample inputs. If modifying the methodology (rules, reference docs), test them against the demo scenarios.
4. **Submit a pull request** with a clear description of what you changed and why.

### Areas Where Help is Needed

- **Additional language support** for the language-switching methodology.
- **More dish family patterns** in `reference/dish-family-thinking.md`.
- **Improved source lists** for different global regions.
- **CLI/MCP tool enhancements** (better output formatting, additional commands).
- **Test cases** for edge cases and different types of food memories.

### Development Setup

No build step is required. The tools are pure Python with no dependencies.

```bash
# Clone the repo
git clone https://github.com/simon/achiote-food-memory-researcher.git
cd achiote-food-memory-researcher

# Run the CLI tool
python3 tools/achiote_cli.py --help

# Start the MCP server
python3 tools/achiote_mcp.py
```

---

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](LICENSE) file for the full license text.

---

## Additional Resources

- **[`demo/before-after.md`](demo/before-after.md)** — The same memory handled by a generic assistant vs. Achiote, showing the difference in approach and output.
- **[`llms.txt`](llms.txt)** — Structured information for AI search engines and language models about this project.
- **[Live demo website](https://achiote.example.com)** — A public proof-of-concept (link provided in repository, not bundled).

---

*Achiote is for every family that carried a kitchen across a border, and for the kids who have the taste but not the words.*