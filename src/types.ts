import type { Point } from "./data/curves.ts";

// ink = writing (black), law = formulas/laws (blue), result = final results (red, boxed)
export type Tone = "ink" | "law" | "result";

export type TableRow = { state: string; x: string; cells: string[] };

// label is written next to the curve point closest to t = labelAt (default: last point).
export type GraphCurve = { points: Point[]; label?: string; labelAt?: number; labelBelow?: boolean; dashed?: boolean; tone?: Tone };

export type GraphSpec = {
  xMax: number;
  yMax: number;
  xStep: number;
  yStep: number;
  xLabel: string;
  yLabel: string;
  curves: GraphCurve[];
  tangents?: { at: Point; from: Point; to: Point }[];
  halfLife?: { t: number; y: number; label: string };
};

// In `text`, anything between $...$ is rendered with KaTeX (mhchem \ce{} available) in an
// isolated LTR span; everything else is Arabic text.
export type Visual =
  | { kind: "text"; text: string; tone?: Tone }
  | { kind: "formula"; tex: string; tone?: Tone }
  | { kind: "result"; tex: string }
  | { kind: "table"; species: string[]; rows: TableRow[] }
  | { kind: "graph"; graph: GraphSpec }
  | { kind: "image"; src: string; height: number };

export type Scene = {
  id: string;
  bar: string; // exercise / question shown in the fixed top bar
  narration: string; // spoken Arabic, no symbols: the single source of the voice-over
  visuals: Visual[];
  durationInFrames: number; // estimated from narration; replaced by audio length when audio exists
};

export type Episode = { number: number; title: string; next: string; scenes: Scene[] };
