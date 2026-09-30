import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, progress } from "../theme.ts";
import { Tex } from "./Formula.tsx";

// Final result in red; the frame around it is drawn with stroke-dashoffset once the text is written.
export const ResultBox: React.FC<{ tex: string; start: number; duration: number; size?: number }> = ({ tex, start, duration, size = 52 }) => {
  const frame = useCurrentFrame();
  const write = progress(frame, start, duration * 0.6);
  const box = progress(frame, start + duration * 0.6, duration * 0.4);
  return (
    <div dir="ltr" style={{ unicodeBidi: "isolate", alignSelf: "flex-start", position: "relative", padding: "10px 30px", color: COLORS.result, fontSize: size }}>
      <div style={{ clipPath: `inset(-20% ${(1 - write) * 100}% -20% 0)` }}>
        <Tex tex={tex} display />
      </div>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
        <rect x={2} y={2} rx={10} style={{ width: "calc(100% - 4px)", height: "calc(100% - 4px)" }} fill="none" stroke={COLORS.result} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - box} />
      </svg>
    </div>
  );
};
