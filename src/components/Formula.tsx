import katex from "katex";
import "katex/contrib/mhchem";
import "katex/dist/katex.min.css";
import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, progress } from "../theme.ts";
import type { Tone } from "../types.ts";

export const renderTex = (tex: string, display = false): string =>
  katex.renderToString(display ? `\\displaystyle ${tex}` : tex, { throwOnError: false, output: "html" });

// Formula / equation / number with unit: always an isolated LTR island inside the RTL page.
export const Tex: React.FC<{ tex: string; display?: boolean; style?: React.CSSProperties }> = ({ tex, display, style }) => (
  <span dir="ltr" style={{ unicodeBidi: "isolate", ...style }} dangerouslySetInnerHTML={{ __html: renderTex(tex, display) }} />
);

// Display formula written left → right like a marker.
export const Formula: React.FC<{ tex: string; tone?: Tone; start: number; duration: number; size?: number }> = ({
  tex,
  tone = "ink",
  start,
  duration,
  size = 50,
}) => {
  const p = progress(useCurrentFrame(), start, duration);
  return (
    <div
      dir="ltr"
      style={{
        unicodeBidi: "isolate",
        alignSelf: "flex-start",
        color: COLORS[tone],
        fontSize: size,
        clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`,
      }}
    >
      <Tex tex={tex} display />
    </div>
  );
};
