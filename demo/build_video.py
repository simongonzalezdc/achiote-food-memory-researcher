"""
Build the Achiote demo video from a screen capture, using mcp-video.

Methodology: keep the core script stable; platform specs drive layout.
This renders a vertical-first 9:16 master plus a 16:9 adapt, with the
on-screen TEXT retention beats from demo/VIDEO_SCRIPT.md.

Prerequisites
-------------
- mcp-video installed and importable (workspaces/mcp-video).
- FFmpeg with the drawtext filter (text overlays).
- A screen capture of the live app at achiote.kyanitelabs.tech/app
  performing ONE real reconstruction end-to-end, with voiceover already
  recorded onto the capture (or add it in your editor afterwards).

Usage
-----
    python demo/build_video.py path/to/screen-capture.mov
"""

import os
import sys
from pathlib import Path

# Import mcp-video from the sibling workspace if it isn't on the path.
for candidate in (
    Path.home() / "workspaces" / "mcp-video",
    Path.home() / "workspaces" / "kyanite-labs" / "mcp-video",
):
    if candidate.exists():
        sys.path.insert(0, str(candidate))
        break

try:
    from mcp_video import Client
except ImportError:
    sys.exit(
        "mcp-video not importable. Install it or run from a machine with "
        "the mcp-video workspace present."
    )

# TEXT retention beats keyed by start second (from VIDEO_SCRIPT.md).
# (start_seconds, duration, text, position)
BEATS = [
    (0.0, 4.0, "The recipe was never written down.", "center"),
    (4.0, 4.0, "The memory was.", "center"),
    (8.0, 8.0, "Not a summarizer.", "bottom-center"),
    (16.0, 8.0, "Messy input is correct input.", "bottom-center"),
    (24.0, 9.0, "Investigates, then proves.", "bottom-center"),
    (33.0, 15.0, "Evidence, not a guess.", "bottom-center"),
    (48.0, 10.0, "One small taste.", "bottom-center"),
    (58.0, 10.0, "Folder = researcher.  ICM.", "bottom-center"),
    (68.0, 7.0, "Bring a memory back to the table.", "center"),
]

ACCENT = "#9c2a16"  # oxblood, matches the site design system


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("Usage: python demo/build_video.py <screen-capture.mov>")
    src = sys.argv[1]
    if not os.path.isfile(src):
        sys.exit(f"Not found: {src}")

    editor = Client()
    info = editor.info(src)
    print(f"Source: {os.path.basename(src)}  {info.duration:.1f}s  {info.resolution}")

    # 1) Trim to the demo window (cap at 90s per the audit rule).
    clip = editor.trim(src, start="0", duration=str(min(info.duration, 90)))
    current = clip.output_path

    # 2) Layer the retention-beat text overlays.
    for start, dur, text, pos in BEATS:
        if start >= info.duration:
            continue
        try:
            res = editor.add_text(
                current,
                text=text,
                position=pos,
                size=54,
                color="white",
                start_time=start,
                duration=dur,
            )
            current = res.output_path
            print(f"  beat @ {start:>4.0f}s  {text!r}")
        except Exception as exc:  # drawtext unavailable -> skip, keep going
            print(f"  (skipped beat {text!r}: {exc})")

    # 3) Platform outputs: vertical master + 16:9 adapt.
    vertical = editor.resize(current, aspect_ratio="9:16")
    print(f"Vertical master: {vertical.output_path}")
    wide = editor.resize(current, aspect_ratio="16:9")
    print(f"16:9 adapt:      {wide.output_path}")

    # 4) Thumbnail at the receipt reveal (~0:40).
    thumb = editor.thumbnail(current, timestamp=min(40.0, info.duration * 0.55))
    print(f"Thumbnail:       {thumb.frame_path}")

    print("\nDone. Review the vertical master, then post with the caption in VIDEO_SCRIPT.md.")


if __name__ == "__main__":
    main()
