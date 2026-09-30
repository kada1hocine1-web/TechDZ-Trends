import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, progress } from "../theme.ts";
import type { TableRow } from "../types.ts";
import { Tex } from "./Formula.tsx";

// Advancement table (initial / intermediate / final rows), filled cell by cell in reading order (right → left).
export const AdvancementTable: React.FC<{ species: string[]; rows: TableRow[]; start: number; duration: number }> = ({
  species,
  rows,
  start,
  duration,
}) => {
  const frame = useCurrentFrame();
  const grid = progress(frame, start, duration * 0.12);
  const cells: string[][] = [["معادلة التفاعل", "", ...species], ...rows.map((r) => [r.state, r.x, ...r.cells])];
  const total = cells.reduce((a, r) => a + r.length, 0);
  const slot = (duration * 0.85) / total;
  let k = 0;
  const border = `3px solid rgba(29,29,31,${grid})`;
  return (
    <table style={{ borderCollapse: "collapse", fontSize: 34, color: COLORS.ink, alignSelf: "center" }}>
      <tbody>
        {cells.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => {
              const p = progress(frame, start + duration * 0.12 + slot * k++, slot);
              if (r === 0 && c === 1) return null;
              const isTex = c >= 2 || (c === 1 && r > 0);
              return (
                <td
                  key={c}
                  colSpan={r === 0 && c === 0 ? 2 : 1}
                  style={{
                    border,
                    padding: "12px 20px",
                    textAlign: "center",
                    fontWeight: c === 0 || r === 0 ? 700 : 400,
                    color: r === 0 ? COLORS.law : COLORS.ink,
                    whiteSpace: "nowrap",
                  }}
                >
                  <div style={{ clipPath: `inset(-20% 0 -20% ${(1 - p) * 100}%)` }}>{isTex ? <Tex tex={cell} /> : cell}</div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
