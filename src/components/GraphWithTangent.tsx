import React, { useId } from "react";
import { useCurrentFrame } from "remotion";
import type { Point } from "../data/curves.ts";
import { COLORS, progress } from "../theme.ts";
import type { GraphSpec } from "../types.ts";

const W = 900;
const H = 640;
const PAD = { left: 90, right: 40, top: 60, bottom: 70 };

const num = (v: number) => String(Math.round(v * 100) / 100).replace(".", ",");

// Redraws a figure from the digitized values: axes, curve(s), animated tangent, dotted t1/2 guides.
export const GraphWithTangent: React.FC<{ graph: GraphSpec; start: number; duration: number }> = ({ graph, start, duration }) => {
  const frame = useCurrentFrame();
  const g = graph;
  const X = (t: number) => PAD.left + (t / g.xMax) * (W - PAD.left - PAD.right);
  const Y = (y: number) => H - PAD.bottom - (y / g.yMax) * (H - PAD.top - PAD.bottom);
  const path = (pts: Point[]) => pts.map(([t, y], i) => `${i ? "L" : "M"}${X(t).toFixed(1)} ${Y(y).toFixed(1)}`).join(" ");
  const extras = (g.tangent ? 1 : 0) + (g.halfLife ? 1 : 0);
  const curveEnd = extras === 0 ? 0.85 : extras === 1 ? 0.6 : 0.5;
  const axes = progress(frame, start, duration * 0.12);
  const curve = progress(frame, start + duration * 0.12, duration * (curveEnd - 0.12));
  const tangentStart = curveEnd + 0.03;
  const tan = progress(frame, start + duration * tangentStart, duration * 0.2);
  const half = progress(frame, start + duration * (g.tangent ? tangentStart + 0.23 : tangentStart), duration * 0.18);
  const xs = Array.from({ length: Math.floor(g.xMax / g.xStep) + 1 }, (_, i) => i * g.xStep);
  const ys = Array.from({ length: Math.floor(g.yMax / g.yStep) + 1 }, (_, i) => i * g.yStep);
  const id = useId();
  const draw = (p: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} direction="ltr" style={{ fontFamily: "inherit", overflow: "visible" }}>
      <g opacity={axes * 0.5}>
        {xs.map((t) => (
          <line key={`x${t}`} x1={X(t)} x2={X(t)} y1={Y(0)} y2={Y(g.yMax)} stroke="#c9d3e0" strokeWidth={1} />
        ))}
        {ys.map((y) => (
          <line key={`y${y}`} x1={X(0)} x2={X(g.xMax)} y1={Y(y)} y2={Y(y)} stroke="#c9d3e0" strokeWidth={1} />
        ))}
      </g>
      <path d={`M${X(0)} ${Y(0)} L${X(g.xMax) + 20} ${Y(0)}`} stroke={COLORS.ink} strokeWidth={4} fill="none" {...draw(axes)} />
      <path d={`M${X(0)} ${Y(0)} L${X(0)} ${Y(g.yMax) - 20}`} stroke={COLORS.ink} strokeWidth={4} fill="none" {...draw(axes)} />
      <g opacity={axes} fontSize={24} fill={COLORS.ink}>
        {xs.map((t) => (
          <text key={`tx${t}`} x={X(t)} y={Y(0) + 32} textAnchor="middle">
            {num(t)}
          </text>
        ))}
        {ys.map((y) => (
          <text key={`ty${y}`} x={X(0) - 12} y={Y(y) + 8} textAnchor="end">
            {num(y)}
          </text>
        ))}
        <text x={X(g.xMax) + 10} y={Y(0) + 62} textAnchor="end" fontSize={28} fontWeight={700}>
          {g.xLabel}
        </text>
        <text x={X(0) + 12} y={Y(g.yMax) - 28} fontSize={28} fontWeight={700}>
          {g.yLabel}
        </text>
      </g>
      {g.curves.map((c, i) => {
        const last = c.points[c.points.length - 1];
        return (
          <g key={i}>
            <mask id={`${id}-m${i}`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
              <path d={path(c.points)} stroke="#fff" strokeWidth={9} fill="none" {...draw(curve)} />
            </mask>
            <path
              d={path(c.points)}
              stroke={COLORS[c.tone ?? "ink"]}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={c.dashed ? "14 12" : undefined}
              mask={`url(#${id}-m${i})`}
            />
            {c.label ? (
              <text x={X(last[0]) - 6} y={Y(last[1]) - 14} textAnchor="end" fontSize={30} fontWeight={700} fill={COLORS[c.tone ?? "ink"]} opacity={curve}>
                {c.label}
              </text>
            ) : null}
          </g>
        );
      })}
      {g.tangent ? (
        <g>
          <path d={`M${X(g.tangent.from[0])} ${Y(g.tangent.from[1])} L${X(g.tangent.to[0])} ${Y(g.tangent.to[1])}`} stroke={COLORS.law} strokeWidth={4} fill="none" {...draw(tan)} />
          <circle cx={X(g.tangent.at[0])} cy={Y(g.tangent.at[1])} r={9} fill={COLORS.result} opacity={tan > 0 ? 1 : 0} />
        </g>
      ) : null}
      {g.halfLife ? (
        <g opacity={half > 0 ? 1 : 0}>
          <path d={`M${X(0)} ${Y(g.halfLife.y)} L${X(g.halfLife.t)} ${Y(g.halfLife.y)} L${X(g.halfLife.t)} ${Y(0)}`} stroke={COLORS.result} strokeWidth={3} strokeDasharray="10 8" fill="none" opacity={half} />
          <text x={X(g.halfLife.t)} y={Y(0) - 14} textAnchor="middle" fontSize={28} fontWeight={700} fill={COLORS.result} opacity={half}>
            {g.halfLife.label}
          </text>
        </g>
      ) : null}
    </svg>
  );
};
