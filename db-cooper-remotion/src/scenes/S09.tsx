import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {C, seeded, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Counter} from '../components/Counter';
import {Stamp} from '../components/Stamp';
import {cue} from '../data/script';

const COLS = 7;
const ROWS = 8;
const r = seeded(909);
const CARDS = Array.from({length: COLS * ROWS}).map((_, i) => ({
  x: 90 + (i % COLS) * 150 + (r() - 0.5) * 30,
  y: 300 + Math.floor(i / COLS) * 100 + (r() - 0.5) * 24,
  rot: (r() - 0.5) * 8,
  order: r(),
}));
const STRINGS = Array.from({length: 14}).map(() => [Math.floor(r() * CARDS.length), Math.floor(r() * CARDS.length)]);

export const S09: React.FC = () => {
  const f = useStep();
  const start = cue('s09', 'traque', 0.05);
  const eightAt = cue('s09', 'huit', 0.3);
  const neverAt = cue('s09', 'jamais', 0.75);
  const shown = interpolate(f, [start, eightAt + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const strings = interpolate(f, [eightAt, neverAt], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#8a6d4a'}}>
      {CARDS.map((c, i) =>
        c.order <= shown ? (
          <TornPaper key={i} x={c.x} y={c.y} w={120} h={82} seed={900 + i} rotate={c.rot} rough={5}>
            <svg width={120} height={82}>
              <circle cx={30} cy={32} r={13} fill={C.ink} opacity={0.75} />
              <path d="M12 72 Q30 44 48 72 Z" fill={C.ink} opacity={0.75} />
              <rect x={60} y={24} width={48} height={5} fill={C.ink} opacity={0.4} />
              <rect x={60} y={40} width={38} height={5} fill={C.ink} opacity={0.4} />
              <rect x={60} y={56} width={44} height={5} fill={C.ink} opacity={0.4} />
            </svg>
            <div style={{position: 'absolute', left: 54, top: -6, width: 14, height: 14, borderRadius: '50%', background: C.red, boxShadow: '0 2px 2px rgba(0,0,0,0.5)'}} />
          </TornPaper>
        ) : null,
      )}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {STRINGS.map(([a, b], i) => {
          const A = CARDS[a];
          const B = CARDS[b];
          const vis = i / STRINGS.length < strings && A.order <= shown && B.order <= shown;
          return vis ? <line key={i} x1={A.x + 1} y1={A.y - 34} x2={B.x + 1} y2={B.y - 34} stroke={C.red} strokeWidth={3} /> : null;
        })}
      </svg>
      <TornPaper x={540} y={1470} w={760} h={170} seed={950} rotate={-2}>
        <div style={{fontFamily: TYPE, fontSize: 40, color: C.ink, textAlign: 'center', marginTop: 110}}>SUSPECTS INTERROGÉS</div>
      </TornPaper>
      <Counter x={540} y={1430} value={800} suffix="+" start={eightAt} dur={30} size={80} rotate={-3} />
      <Stamp x={540} y={700} start={neverAt} size={110} rotate={-10}>
        JAMAIS RETROUVÉ
      </Stamp>
    </AbsoluteFill>
  );
};
