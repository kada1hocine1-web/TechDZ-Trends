import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {C, seeded, Stage, TITLE, TornPaper, useStep} from '../components/TornPaper';
import {MaskedMan} from './S01';
import {cue} from '../data/script';

const r = seeded(404);
const HOUSES = Array.from({length: 6}).map((_, i) => ({x: 10 + i * 180, h: 170 + r() * 80, lit: r() > 0.5}));

export const S04: React.FC = () => {
  const f = useStep();
  const blindAt = cue('s04', 'aveugle', 0.1);
  const stalkAt = cue('s04', 'traque', 0.4);
  const terrorAt = cue('s04', 'terreur', 0.8);
  const angle = interpolate(f, [0, blindAt, blindAt + 20, stalkAt], [-40, -8, -8, 25], {extrapolateRight: 'clamp'});
  const flash = interpolate(f, [blindAt, blindAt + 3, blindAt + 14], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const path = interpolate(f, [stalkAt, stalkAt + 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.night}}>
      <Stage>
        {/* houses */}
        {HOUSES.map((h, i) => (
          <TornPaper key={i} x={h.x + 80} y={640 - h.h / 2} w={150} h={h.h} seed={410 + i} color="#1b2a40" rough={7}>
            <svg width={150} height={h.h}>
              <path d={`M0 40 L75 0 L150 40 Z`} fill="#0b1422" />
              <rect x={30} y={60} width={34} height={34} fill={h.lit && f % 60 < 45 ? '#e9d68a' : '#0b1422'} />
              <rect x={86} y={60} width={34} height={34} fill="#0b1422" />
            </svg>
          </TornPaper>
        ))}
        <div style={{position: 'absolute', left: -420, width: 1920, top: 700, height: 1000, background: '#0a1220'}} />
        {/* stalking route */}
        <svg width={1080} height={1080} style={{position: 'absolute', inset: 0}}>
          <path d="M60 750 C 240 690, 300 800, 470 730 S 760 670, 1020 750" stroke={C.red} strokeWidth={7} strokeDasharray="18 16" fill="none" pathLength={1} style={{strokeDasharray: `${path} 1`}} />
        </svg>
        {/* intruder + flashlight beam */}
        <div style={{position: 'absolute', left: 30, top: 420}}>
          <MaskedMan width={230} />
        </div>
        <div style={{position: 'absolute', left: 210, top: 560, width: 900, height: 360, transformOrigin: '0% 50%', transform: `translateY(-180px) rotate(${angle}deg)`, clipPath: 'polygon(0% 48%, 100% 0%, 100% 100%, 0% 52%)', background: 'linear-gradient(90deg, rgba(255,250,220,0.95), rgba(255,250,220,0.05))'}} />
        <div style={{position: 'absolute', left: -420, top: -330, width: 1920, height: 1920, background: '#fffbe6', opacity: flash}} />
        {f >= terrorAt && (
          <TornPaper x={760} y={140} w={520} h={120} seed={420} color={C.red} rotate={-3}>
            <div style={{fontFamily: TITLE, fontSize: 90, color: C.cream, textAlign: 'center', lineHeight: '125px', letterSpacing: 4}}>TERREUR</div>
          </TornPaper>
        )}
      </Stage>
    </AbsoluteFill>
  );
};
