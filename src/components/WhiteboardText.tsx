import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, progress } from "../theme.ts";
import type { Tone } from "../types.ts";
import { Tex } from "./Formula.tsx";

// Arabic text revealed right → left like a marker; $...$ parts are KaTeX islands (LTR, isolated).
export const WhiteboardText: React.FC<{ text: string; tone?: Tone; start: number; duration: number; size?: number }> = ({
  text,
  tone = "ink",
  start,
  duration,
  size = 44,
}) => {
  const p = progress(useCurrentFrame(), start, duration);
  const parts = text.split("$");
  return (
    <div
      style={{
        color: COLORS[tone],
        fontSize: size,
        lineHeight: 1.5,
        fontWeight: 600,
        clipPath: `inset(-20% 0 -20% ${(1 - p) * 100}%)`,
      }}
    >
      {parts.map((part, i) => (i % 2 === 1 ? <Tex key={i} tex={part} style={{ fontSize: "1.05em" }} /> : <span key={i}>{part}</span>))}
    </div>
  );
};
