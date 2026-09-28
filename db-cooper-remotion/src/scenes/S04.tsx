import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {C, TornPaper, useStep} from '../components/TornPaper';
import {cue} from '../data/script';

const WIRES = ['#B3261E', '#EDE3CC', '#C8A97E', '#B3261E', '#EDE3CC'];

export const S04: React.FC = () => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const open = spring({frame: f - cue('s04', 'ouvre', 0.1), fps, config: {damping: 13, stiffness: 90}});
  const cylAt = cue('s04', 'cylindres', 0.45);
  const wiresAt = cue('s04', 'fils', 0.8);
  const wires = interpolate(f, [wiresAt - 6, wiresAt + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const blink = f >= cylAt && Math.floor((f - cylAt) / 7.5) % 2 === 0;

  return (
    <AbsoluteFill style={{background: C.kraft}}>
      <div style={{position: 'absolute', inset: 0, transform: 'scale(0.85)', transformOrigin: '540px 300px'}}>
      <TornPaper x={540} y={760} w={960} h={900} seed={401} color="#3a2a1c" rotate={-1.5}>
        {/* case interior */}
        <div style={{position: 'absolute', left: 60, right: 60, top: 390, bottom: 70, background: '#1d140d', borderRadius: 18}} />
        <svg width={960} height={900} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 7}).map((_, i) => {
            const x = 130 + i * 105;
            const on = blink && i % 2 === (Math.floor(f / 15) % 2);
            return (
              <g key={i} opacity={f >= cylAt ? 1 : 0.9}>
                <rect x={x} y={470} width={80} height={290} rx={14} fill={on ? '#e0473e' : C.red} />
                <rect x={x + 12} y={480} width={14} height={270} rx={7} fill="rgba(255,255,255,0.28)" />
                <rect x={x - 4} y={520} width={88} height={16} fill={C.ink} />
                <rect x={x - 4} y={690} width={88} height={16} fill={C.ink} />
                {on && <circle cx={x + 40} cy={455} r={12} fill="#ff6b5e" />}
              </g>
            );
          })}
          <rect x={140} y={780} width={680} height={40} rx={6} fill={C.ink} />
          {WIRES.map((c, i) => (
            <path
              key={i}
              d={`M${170 + i * 140} 480 C ${250 + i * 90} ${300 - i * 20}, ${480 - i * 60} ${860 - i * 20}, ${200 + i * 130} 800`}
              stroke={c}
              strokeWidth={9}
              fill="none"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${wires} 1`}
            />
          ))}
        </svg>
        {/* lid */}
        <div
          style={{
            position: 'absolute',
            left: 30,
            right: 30,
            top: 360,
            height: 420,
            background: '#4a3624',
            borderRadius: 20,
            transformOrigin: '50% 0%',
            transform: `perspective(1400px) rotateX(${-open * 172}deg)`,
            boxShadow: 'inset 0 0 0 10px #2a1d12',
            display: open > 0.55 ? 'none' : 'block',
          }}
        >
          <div style={{position: 'absolute', left: 120, top: 180, width: 70, height: 40, background: C.kraft, borderRadius: 6}} />
          <div style={{position: 'absolute', right: 120, top: 180, width: 70, height: 40, background: C.kraft, borderRadius: 6}} />
        </div>
        {/* lid seen from inside (open) */}
        <div
          style={{
            position: 'absolute',
            left: 30,
            right: 30,
            top: 360 - 330 * Math.max(0, (open - 0.55) / 0.45),
            height: 330 * Math.max(0, (open - 0.55) / 0.45),
            background: '#2a1d12',
            borderRadius: 20,
            boxShadow: 'inset 0 0 0 12px #4a3624',
          }}
        />
        {/* handle */}
        <div style={{position: 'absolute', left: 380, top: open > 0.55 ? 330 - 340 : 330, width: 200, height: 50, border: '16px solid #2a1d12', borderBottom: 'none', borderRadius: '30px 30px 0 0', opacity: open > 0.55 ? 0 : 1}} />
      </TornPaper>
      </div>
    </AbsoluteFill>
  );
};
