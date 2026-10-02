import React from 'react';
import {AbsoluteFill, spring, useVideoConfig} from 'remotion';
import {C, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Counter} from '../components/Counter';
import {Tape} from '../components/Tape';
import {cue} from '../data/script';

// A 20 $ bill drawn in code.
export const Bill: React.FC<{width: number; decay?: number}> = ({width, decay = 0}) => (
  <svg width={width} height={width * 0.43} viewBox="0 0 300 130">
    <rect x={2} y={2} width={296} height={126} rx={4} fill={decay ? '#b5a57a' : '#cfd6bf'} stroke="#4f5b45" strokeWidth={3} />
    <rect x={12} y={12} width={276} height={106} fill="none" stroke="#4f5b45" strokeWidth={2} />
    <ellipse cx={150} cy={65} rx={36} ry={44} fill="#e2e6d6" stroke="#4f5b45" strokeWidth={2} />
    <circle cx={150} cy={56} r={14} fill="#4f5b45" />
    <path d="M126 96 Q150 70 174 96 Z" fill="#4f5b45" />
    <text x={30} y={46} fontFamily="Georgia, serif" fontSize={30} fill="#4f5b45" fontWeight="bold">20</text>
    <text x={236} y={112} fontFamily="Georgia, serif" fontSize={30} fill="#4f5b45" fontWeight="bold">20</text>
    {decay > 0 &&
      [0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={40 + i * 75} cy={30 + (i % 2) * 70} rx={30 * decay} ry={18 * decay} fill="#6b5438" opacity={0.45} />
      ))}
  </svg>
);

const Stack: React.FC<{x: number; y: number; at: number; rotate: number}> = ({x, y, at, rotate}) => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - at, fps, config: {damping: 12}});
  return (
    <div style={{position: 'absolute', left: x, top: y - (1 - p) * 500, opacity: p, transform: `rotate(${rotate}deg)`, filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.4))'}}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{position: 'absolute', left: i * 2, top: -i * 7}}>
          <Bill width={300} />
        </div>
      ))}
      <div style={{position: 'absolute', left: 120, top: -34, width: 60, height: 140, background: C.red}} />
    </div>
  );
};

export const S05: React.FC = () => {
  const f = useStep();
  const lines = [
    {at: cue('s05', 'deux', 0.15), text: '1. 200 000 $ EN BILLETS DE 20'},
    {at: cue('s05', 'million', 0.4), text: '   (+ 1,5 MILLION AUJOURD\'HUI)'},
    {at: cue('s05', 'quatre', 0.65), text: '2. 4 PARACHUTES'},
    {at: cue('s05', 'camion', 0.8), text: '3. 1 CAMION-CITERNE, SEATTLE'},
  ];
  return (
    <AbsoluteFill style={{background: C.kraft}}>
      <TornPaper x={540} y={620} w={900} h={640} seed={501} rotate={1.2}>
        <div style={{position: 'absolute', top: 30, left: 50, fontFamily: TITLE, fontSize: 96, color: C.red, letterSpacing: 4}}>SES EXIGENCES</div>
        <div style={{position: 'absolute', top: 150, left: 50, right: 30, height: 3, background: C.ink, opacity: 0.4}} />
        {lines.map((l, i) => (
          <div key={i} style={{position: 'absolute', top: 190 + i * 88, left: 50, fontFamily: TYPE, fontSize: 40, color: C.ink, whiteSpace: 'pre'}}>
            {l.text.slice(0, Math.max(0, Math.floor((f - l.at) / 1.25)))}
          </div>
        ))}
      </TornPaper>
      <Tape x={130} y={320} rotate={-40} seed={51} />
      <Tape x={950} y={320} rotate={40} seed={52} />
      <Counter x={330} y={990} value={200000} suffix=" $" start={lines[0].at} dur={30} size={78} rotate={-5} />
      <Counter x={790} y={1000} value={4} suffix=" PARACHUTES" start={lines[2].at} dur={12} size={50} rotate={6} />
      <Stack x={60} y={1470} at={lines[0].at + 6} rotate={-8} />
      <Stack x={390} y={1500} at={lines[0].at + 12} rotate={4} />
      <Stack x={720} y={1460} at={lines[0].at + 18} rotate={-3} />
    </AbsoluteFill>
  );
};
