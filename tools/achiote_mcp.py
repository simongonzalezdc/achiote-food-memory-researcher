#!/usr/bin/env python3
"""Minimal stdio MCP server for Achiote."""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any

from achiote_cli import build_intake, quality_gate, receipt_template


SERVER_INFO = {"name": "achiote-food-memory-researcher", "version": "0.1.0"}


TOOLS = [
    {
        "name": "achiote_intake",
        "description": "Turn a food or drink memory fragment into structured Achiote intake, sufficiency, and next questions.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "fragment": {"type": "string", "description": "Food or drink memory fragment."},
                "location": {"type": "string", "description": "Optional current city, metro, state, or country."},
                "mode": {"type": "string", "enum": ["family", "professional"], "default": "family"},
            },
            "required": ["fragment"],
        },
        "annotations": {"readOnlyHint": True, "destructiveHint": False},
    },
    {
        "name": "achiote_memory_receipt_template",
        "description": "Return the required Memory Receipt structure for an Achiote reconstruction.",
        "inputSchema": {"type": "object", "properties": {}},
        "annotations": {"readOnlyHint": True, "destructiveHint": False},
    },
    {
        "name": "achiote_quality_gate",
        "description": "Check a draft Achiote answer for required evidence-ledger and minimum-viable-cue sections.",
        "inputSchema": {
            "type": "object",
            "properties": {"text": {"type": "string", "description": "Draft answer to check."}},
            "required": ["text"],
        },
        "annotations": {"readOnlyHint": True, "destructiveHint": False},
    },
]


def _content(data: Any) -> dict[str, Any]:
    text = data if isinstance(data, str) else json.dumps(data, indent=2, ensure_ascii=False)
    return {"content": [{"type": "text", "text": text}]}


def call_tool(name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    if name == "achiote_intake":
        return _content(
            build_intake(
                fragment=arguments["fragment"],
                location=arguments.get("location"),
                mode=arguments.get("mode", "family"),
            )
        )
    if name == "achiote_memory_receipt_template":
        return _content(receipt_template())
    if name == "achiote_quality_gate":
        return _content(quality_gate(arguments["text"]))
    raise ValueError(f"unknown tool: {name}")


def handle(message: dict[str, Any]) -> dict[str, Any] | None:
    msg_id = message.get("id")
    method = message.get("method")
    params = message.get("params") or {}

    if msg_id is None:
        return None

    try:
        if method == "initialize":
            result = {
                "protocolVersion": "2025-11-25",
                "capabilities": {"tools": {}},
                "serverInfo": SERVER_INFO,
            }
        elif method == "tools/list":
            result = {"tools": TOOLS}
        elif method == "tools/call":
            result = call_tool(params["name"], params.get("arguments") or {})
        else:
            return {"jsonrpc": "2.0", "id": msg_id, "error": {"code": -32601, "message": f"method not found: {method}"}}
        return {"jsonrpc": "2.0", "id": msg_id, "result": result}
    except Exception as exc:
        return {"jsonrpc": "2.0", "id": msg_id, "error": {"code": -32000, "message": str(exc)}}


def serve() -> int:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        response = handle(json.loads(line))
        if response is not None:
            print(json.dumps(response, ensure_ascii=False), flush=True)
    return 0


def self_test() -> int:
    print(json.dumps({"server": SERVER_INFO, "tools": [tool["name"] for tool in TOOLS]}, indent=2))
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Achiote MCP stdio server")
    parser.add_argument("--self-test", action="store_true", help="Print server metadata and exit")
    args = parser.parse_args(argv)
    return self_test() if args.self_test else serve()


if __name__ == "__main__":
    raise SystemExit(main())
