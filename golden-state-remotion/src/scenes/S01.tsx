import React from 'react';
import {AbsoluteFill, spring, useVideoConfig} from 'remotion';
import {C, seeded, Stage, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Tape} from '../components/Tape';
import {cue} from '../data/script';

// Masked intruder silhouette (balaclava), head and shoulders.
export const MaskedMan: React.FC<{width: number; eyes?: boolean}> = ({width, eyes = true}) => (
  <svg width={width} height={width * 1.2} viewBox="0 0 300 360">
    <path d="M10 360 Q20 250 100 225 L150 245 L200 225 Q280 250 290 360 Z" fill={C.ink} />
    <path d="M150 20 C 225 20, 240 90, 235 150 C 230 215, 190 250, 150 250 C 110 250, 70 215, 65 150 C 60 90, 75 20, 150 20 Z" fill="#1d1d1d" />
    <rect x={88} y={118} width={124} height={34} rx={17} fill={C.cream} opacity={0.18} />
    {eyes && (
      <>
        <ellipse cx={122} cy={135} rx={13} ry={8} fill={C.cream} />
        <ellipse cx={178} cy={135} rx={13} ry={8} fill={C.cream} />
        <circle cx={122} cy={135} r={5} fill={C.ink} />
        <circle cx={178} cy={135} r={5} fill={C.ink} />
      </>
    )}
  </svg>
);

// Stylised outline of California.
export const CALIFORNIA =
  'M70 20 L250 20 L250 260 L520 560 Q540 600 520 640 L500 700 L380 700 Q360 640 300 600 Q230 560 200 500 Q160 440 140 380 Q110 300 80 230 Q60 150 70 20 Z';

export const S01: React.FC = () => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const years = '1974 — 1986';
  const typed = years.slice(0, Math.max(0, Math.floor((f - 6) / 2)));
  const map = spring({frame: f, fps, config: {damping: 15}});
  const manAt = cue('s01', 'intrus', 0.3);
  const man = spring({frame: f - manAt, fps, config: {damping: 14}});
  const r = seeded(19);
  const dots = Array.from({length: 14}).map(() => ({x: 150 + r() * 250, y: 250 + r() * 380}));
  const dotsAt = cue('s01', 'terrorise', 0.6);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Stage>
        <TornPaper x={330} y={110} w={520} h={110} seed={11} rotate={-2}>
          <div style={{fontFamily: TYPE, fontSize: 70, color: C.ink, textAlign: 'center', lineHeight: '110px'}}>{typed}</div>
        </TornPaper>
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - map) * 900}px)`}}>
          <TornPaper x={380} y={520} w={600} h={680} seed={12} color={C.kraft} rotate={1.5}>
            <svg width={600} height={680} viewBox="0 0 600 720">
              <path d={CALIFORNIA} fill={C.cream} stroke={C.ink} strokeWidth={5} />
              {dots.map((d, i) =>
                f >= dotsAt + i * 2 ? <circle key={i} cx={d.x} cy={d.y} r={11} fill={C.red} stroke={C.ink} strokeWidth={2} /> : null,
              )}
            </svg>
            <div style={{position: 'absolute', left: 30, bottom: 30, fontFamily: TITLE, fontSize: 64, color: C.red, letterSpacing: 4}}>CALIFORNIE</div>
          </TornPaper>
          <Tape x={120} y={200} rotate={-38} seed={1} />
        </div>
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - man) * 700}px)`}}>
          <TornPaper x={820} y={560} w={330} h={420} seed={13} color={C.night} rotate={-3}>
            <div style={{position: 'absolute', left: 15, top: 20}}>
              <MaskedMan width={300} />
            </div>
          </TornPaper>
          <Tape x={880} y={360} rotate={30} seed={2} />
        </div>
      </Stage>
    </AbsoluteFill>
  );
};
