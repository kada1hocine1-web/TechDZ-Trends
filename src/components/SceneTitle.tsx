import React from "react";
import { useCurrentFrame } from "remotion";
import { BAR_HEIGHT, COLORS, progress } from "../theme.ts";

// Fixed top bar: exercise / question on the right, episode number on the left, marker underline.
export const SceneTitle: React.FC<{ bar: string; episode: number }> = ({ bar, episode }) => {
  const p = progress(useCurrentFrame(), 0, 20);
  return (
    <div style={{ height: BAR_HEIGHT, display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
      <div style={{ fontSize: 46, fontWeight: 700, color: COLORS.law, clipPath: `inset(-20% 0 -20% ${(1 - p) * 100}%)` }}>{bar}</div>
      <div style={{ fontSize: 32, fontWeight: 600, color: "#6b6b6b" }}>الحلقة {episode}</div>
      <svg style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: 8 }} viewBox="0 0 1000 8" preserveAspectRatio="none">
        <path d="M1000 4 C 700 1, 300 7, 0 4" stroke={COLORS.law} strokeWidth={3} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};
