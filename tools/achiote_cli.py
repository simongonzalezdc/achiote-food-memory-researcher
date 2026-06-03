#!/usr/bin/env python3
"""Local CLI for Achiote food-memory research intake and quality checks."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]

QUESTION_BANK = [
    "Where was the person, shop, dish, or drink from - country, island, city, or community?",
    "What hit first: smell, texture, sauce, heat, sourness, sweetness, wrapper, or serving ritual?",
    "Was it fried, steamed, griddled, boiled, baked, mixed cold, or served as a drink?",
]

METHOD_WORDS = {
    "fried",
    "steamed",
    "griddled",
    "boiled",
    "baked",
    "roasted",
    "wrapped",
    "mixed",
    "cold",
    "drink",
    "soup",
    "sauce",
}

SENSORY_WORDS = {
    "smell",
    "aroma",
    "savory",
    "sweet",
    "sour",
    "spicy",
    "hot",
    "crunchy",
    "soft",
    "chewy",
    "creamy",
    "sticky",
    "color",
    "green",
    "red",
    "yellow",
    "brown",
    "wrapper",
}


def _tokens(text: str) -> list[str]:
    return re.findall(r"[A-Za-z][A-Za-z'-]*", text.lower())


def _matches(words: set[str], text: str) -> list[str]:
    toks = _tokens(text)
    return sorted({token for token in toks if token in words})


def _possible_names(fragment: str) -> list[str]:
    quoted = re.findall(r"['\"]([^'\"]{2,80})['\"]", fragment)
    sounded = re.findall(
        r"(?:sound(?:ed|s)? like|something like|called|said|named)\s+([A-Za-z][A-Za-z' -]{1,60})",
        fragment,
        flags=re.IGNORECASE,
    )
    candidates = [item.strip(" .,:;?!") for item in quoted + sounded]
    return [item for item in dict.fromkeys(candidates) if item]


def _region_clues(fragment: str) -> list[str]:
    clues: list[str] = []
    patterns = [
        r"\b(?:from|near|in)\s+([A-Z][A-Za-z .'-]{2,40})",
        r"\b(Puerto Rican|Mexican|Cuban|Dominican|Colombian|Peruvian|Indian|Filipino|Korean|Chinese|Vietnamese|Thai|Italian|Greek|Lebanese|Ethiopian|Nigerian)\b",
    ]
    for pattern in patterns:
        for match in re.findall(pattern, fragment):
            value = match.strip(" .,:;?!")
            if value and value not in clues:
                clues.append(value)
    return clues


def build_intake(fragment: str, location: str | None = None, mode: str = "family") -> dict[str, Any]:
    sensory = _matches(SENSORY_WORDS, fragment)
    methods = _matches(METHOD_WORDS, fragment)
    possible_names = _possible_names(fragment)
    regions = _region_clues(fragment)
    enough_signal = bool(possible_names and (sensory or methods or regions)) or bool(regions and len(sensory) >= 2)

    missing: list[str] = []
    if not possible_names:
        missing.append("possible name or sound-alike")
    if not regions:
        missing.append("region/community")
    if not sensory:
        missing.append("sensory clues")
    if not methods:
        missing.append("method or serving format")
    if not location:
        missing.append("current location for ingredient access")

    questions = [] if enough_signal else QUESTION_BANK[:3]
    if enough_signal and not location:
        questions = ["Where are you trying to recreate or source this now? City, metro, state, or country is enough."]

    return {
        "mode": mode,
        "fragment": fragment,
        "location": location,
        "clues": {
            "possible_names": possible_names,
            "region_or_community": regions,
            "sensory": sensory,
            "method_or_format": methods,
        },
        "missing": missing,
        "sufficiency": {
            "enough_signal_to_research": enough_signal,
            "reason": (
                "Has a plausible name/community plus sensory or method signal."
                if enough_signal
                else "Needs one or two higher-yield clues before a useful reconstruction."
            ),
        },
        "next_questions": questions,
        "minimum_viable_cue": {
            "instruction": "Build one tiny pantry-level taste, aroma, sip, or texture test before writing a full recipe.",
            "must_include": [
                "what sensory mechanism it tests",
                "what it cannot prove",
                "what result would move confidence up or down",
            ],
        },
    }


def receipt_template() -> str:
    return """# Memory Receipt

## What I am hearing
- 

## Best current hypothesis
Confidence:
Would change my mind:

## Evidence ledger
User said:
Researched:
Inferred:
Unknown:

## Local access path
Pantry/mainstream:
Specialty category:
Online/search phrase:
Substitute:

## Minimum viable cue
Tiny test:
Mechanism:
What it proves:
What it cannot prove:

## Next question or next step
- 
"""


def quality_gate(text: str) -> dict[str, Any]:
    lower = text.lower()
    required = [
        "what i am hearing",
        "best current hypothesis",
        "evidence ledger",
        "local access path",
        "minimum viable cue",
    ]
    missing = [heading for heading in required if heading not in lower]
    anti_patterns = []
    if "recipe" in lower and "minimum viable cue" not in lower:
        anti_patterns.append("recipe-before-cue")
    if "definitely" in lower and "unknown" not in lower:
        anti_patterns.append("certainty-without-unknowns")
    return {
        "passes": not missing and not anti_patterns,
        "missing_sections": missing,
        "anti_patterns": anti_patterns,
    }


def _print(data: Any, output: str) -> None:
    if output == "json":
        print(json.dumps(data, indent=2, ensure_ascii=False))
    elif isinstance(data, str):
        print(data)
    else:
        print(json.dumps(data, indent=2, ensure_ascii=False))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Achiote food-memory researcher helper CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    intake_parser = subparsers.add_parser("intake", help="Turn a memory fragment into structured Achiote intake")
    intake_parser.add_argument("--fragment", required=True, help="Food or drink memory fragment")
    intake_parser.add_argument("--location", help="Current location for ingredient access")
    intake_parser.add_argument("--mode", choices=["family", "professional"], default="family")
    intake_parser.add_argument("--format", choices=["json", "text"], default="text")

    template_parser = subparsers.add_parser("receipt-template", help="Print the Memory Receipt template")
    template_parser.add_argument("--format", choices=["json", "text"], default="text")

    gate_parser = subparsers.add_parser("quality-gate", help="Check whether a draft follows Achiote's output contract")
    gate_parser.add_argument("--text", help="Draft text to check")
    gate_parser.add_argument("--file", type=Path, help="Draft file to check")
    gate_parser.add_argument("--format", choices=["json", "text"], default="json")

    args = parser.parse_args(argv)

    if args.command == "intake":
        data = build_intake(args.fragment, args.location, args.mode)
        _print(data, args.format)
        return 0

    if args.command == "receipt-template":
        template = receipt_template()
        _print({"template": template} if args.format == "json" else template, args.format)
        return 0

    if args.command == "quality-gate":
        if args.file:
            text = args.file.read_text(encoding="utf-8")
        elif args.text:
            text = args.text
        else:
            text = sys.stdin.read()
        _print(quality_gate(text), args.format)
        return 0

    parser.error(f"unknown command {args.command}")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
