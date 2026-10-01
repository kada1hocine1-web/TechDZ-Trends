#!/usr/bin/env python3
"""Write TIMECODES.md: where each voice-over line starts in each rendered video (to place your own voice clips)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
out = ["# Timecodes\n",
       "Start time of each line in the rendered videos (`out/<slug>.mp4`). "
       "Place each recorded line at its start time; each slot lasts until the next line.\n"]
order = [l.split("'")[1] for l in (ROOT / "src" / "registry.ts").read_text().splitlines() if l.startswith("import c")]
for n, rel in enumerate(order, 1):
    slug = rel.split("/")[-1].removesuffix(".json")
    case = json.loads((ROOT / "src" / "cases" / f"{slug}.json").read_text(encoding="utf-8"))
    t = json.loads((ROOT / "src" / "timings" / f"{slug}.json").read_text(encoding="utf-8"))
    out.append(f"## {n:02d}. {case['title'].title()} — `out/{slug}.mp4`\n\n| # | Start | Slot | Line |\n|---|---|---|---|")
    start = 0
    for line, s in zip(case["lines"], t["scenes"]):
        sec = start / t["fps"]
        out.append(f"| {line['id'][1:]} | {int(sec // 60)}:{sec % 60:05.2f} | {s['frames'] / t['fps']:.1f} s | {line['text']} |")
        start += s["frames"]
    out.append(f"\nTotal: {(start + 60) / t['fps']:.1f} s (including a 2 s freeze at the end).\n")
(ROOT / "TIMECODES.md").write_text("\n".join(out), encoding="utf-8")
print("TIMECODES.md written")
