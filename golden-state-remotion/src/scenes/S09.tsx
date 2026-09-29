import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {C, Stage, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {cue} from '../data/script';

// Family tree: levels from the DNA match at the bottom up to shared ancestors and back down.
const LEVELS = [
  {y: 120, xs: [340, 740]},
  {y: 300, xs: [160, 400, 680, 920]},
  {y: 480, xs: [90, 250, 410, 570, 730, 890, 1000]},
  {y: 660, xs: [60, 190, 320, 450, 580, 710, 840, 970]},
];

export const Person: React.FC<{x: number; y: number; seed: number; hl?: boolean}> = ({x, y, seed, hl}) => (
  <TornPaper x={x} y={y} w={96} h={96} seed={seed} rough={5} color={hl ? C.red : C.cream}>
    <svg width={96} height={96}>
      <circle cx={48} cy={36} r={17} fill={hl ? C.cream : C.ink} opacity={0.8} />
      <path d="M18 92 Q48 50 78 92 Z" fill={hl ? C.cream : C.ink} opacity={0.8} />
    </svg>
  </TornPaper>
);

export const S09: React.FC = () => {
  const f = useStep();
  const grow = interpolate(f, [cue('s09', 'bâtissent', 0.5) - 20, cue('s09', 'arbres', 0.85)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const thirdAt = cue('s09', 'troisième', 0.3);
  const fourthAt = cue('s09', 'quatrième', 0.4);
  const shown = (lvl: number) => grow * LEVELS.length >= lvl || lvl === LEVELS.length - 1;
  return (
    <AbsoluteFill style={{background: C.kraft}}>
      <Stage>
        <svg width={1080} height={1080} style={{position: 'absolute', inset: 0}}>
          {LEVELS.slice(0, -1).map((l, li) =>
            l.xs.map((x, i) =>
              LEVELS[li + 1].xs
                .filter((cx) => Math.abs(cx - x) < 200)
                .map((cx, k) =>
                  shown(li) ? <line key={`${li}-${i}-${k}`} x1={x} y1={l.y} x2={cx} y2={LEVELS[li + 1].y} stroke={C.red} strokeWidth={3} /> : null,
                ),
            ),
          )}
        </svg>
        {LEVELS.map((l, li) => (shown(li) ? l.xs.map((x, i) => <Person key={`${li}-${i}`} x={x} y={l.y} seed={900 + li * 10 + i} hl={li === 3 && (i === 1 || i === 6)} />) : null))}
        {f >= thirdAt && (
          <TornPaper x={200} y={830} w={330} h={80} seed={951} rotate={-3}>
            <div style={{fontFamily: TYPE, fontSize: 30, color: C.ink, textAlign: 'center', lineHeight: '80px'}}>COUSIN · 3e DEGRÉ</div>
          </TornPaper>
        )}
        {f >= fourthAt && (
          <TornPaper x={860} y={830} w={330} h={80} seed={952} rotate={3}>
            <div style={{fontFamily: TYPE, fontSize: 30, color: C.ink, textAlign: 'center', lineHeight: '80px'}}>COUSIN · 4e DEGRÉ</div>
          </TornPaper>
        )}
      </Stage>
    </AbsoluteFill>
  );
};
