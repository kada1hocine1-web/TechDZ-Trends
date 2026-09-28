import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {C, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Tape} from '../components/Tape';
import {Counter} from '../components/Counter';
import {cue} from '../data/script';

// Man in a dark suit, black clip-on tie, dark glasses. "bust" for portraits, "figure" for the full silhouette.
export const Man: React.FC<{variant?: 'bust' | 'figure'; width: number; pose?: number}> = ({variant = 'bust', width, pose = 0}) => {
  if (variant === 'figure') {
    // pose 0 = standing, 1 = spread-eagle jump
    const a = pose * 60;
    return (
      <svg width={width} height={width * 2} viewBox="0 0 100 200" style={{overflow: 'visible'}}>
        <g fill={C.ink}>
          <circle cx={50} cy={22} r={13} />
          <path d="M34 40 Q50 34 66 40 L70 110 L30 110 Z" />
          <g transform={`rotate(${-a - 8} 36 44)`}><rect x={28} y={42} width={12} height={62} rx={6} /></g>
          <g transform={`rotate(${a + 8} 64 44)`}><rect x={60} y={42} width={12} height={62} rx={6} /></g>
          <g transform={`rotate(${-a * 0.4} 42 108)`}><rect x={35} y={104} width={14} height={80} rx={6} /></g>
          <g transform={`rotate(${a * 0.4} 58 108)`}><rect x={51} y={104} width={14} height={80} rx={6} /></g>
        </g>
        <rect x={38} y={18} width={24} height={6} rx={3} fill="#000" />
      </svg>
    );
  }
  return (
    <svg width={width} height={width * 1.3} viewBox="0 0 400 520">
      {/* suit */}
      <path d="M20 520 Q30 360 120 330 L200 360 L280 330 Q370 360 380 520 Z" fill={C.ink} />
      {/* shirt */}
      <path d="M150 335 L200 470 L250 335 L230 320 L200 345 L170 320 Z" fill={C.cream} />
      {/* lapels */}
      <path d="M120 330 L200 480 L160 340 Z M280 330 L200 480 L240 340 Z" fill="#2a2a2a" />
      {/* clip-on tie */}
      <path d="M188 348 L212 348 L206 366 L218 470 L200 492 L182 470 L194 366 Z" fill="#050505" />
      <rect x={183} y={400} width={34} height={6} rx={2} fill={C.kraft} />
      {/* neck + head */}
      <path d="M170 300 L230 300 L232 340 L200 350 L168 340 Z" fill="#b89a74" />
      <ellipse cx={200} cy={210} rx={82} ry={104} fill={C.kraft} />
      <path d="M118 190 Q120 100 200 96 Q284 100 284 196 Q270 140 200 138 Q140 140 118 190 Z" fill={C.ink} />
      <ellipse cx={118} cy={220} rx={10} ry={22} fill="#b89a74" />
      <ellipse cx={282} cy={220} rx={10} ry={22} fill="#b89a74" />
      {/* dark glasses */}
      <path d="M130 196 L192 196 L186 236 Q160 246 138 232 Z M208 196 L270 196 L262 232 Q240 246 214 236 Z" fill="#050505" />
      <rect x={186} y={198} width={28} height={6} fill="#050505" />
      <path d="M170 280 Q200 290 230 280" stroke="#6b5438" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M200 236 L194 262 L206 262" stroke="#8d7250" strokeWidth={4} fill="none" />
    </svg>
  );
};

const Label: React.FC<{x: number; y: number; at: number; text: string; line: string; rotate: number; seed: number}> = ({x, y, at, text, line, rotate, seed}) => {
  const f = useStep();
  if (f < at) return null;
  const p = interpolate(f, [at, at + 10], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <path d={line} stroke={C.red} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={`${p} 1`} />
      </svg>
      <TornPaper x={x} y={y} w={text.length * 24 + 40} h={70} seed={seed} rotate={rotate} style={{opacity: p}}>
        <div style={{fontFamily: TYPE, fontSize: 38, lineHeight: '70px', textAlign: 'center', color: C.ink}}>{text}</div>
      </TornPaper>
    </>
  );
};

export const S02: React.FC = () => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const card = spring({frame: f, fps, config: {damping: 15}});
  const ticketAt = cue('s02', 'achète', 0.3);
  const ticket = spring({frame: f - ticketAt, fps, config: {damping: 14}});
  const tear = spring({frame: f - cue('s02', 'Portland', 0.7), fps, config: {damping: 12}});
  const nameAt = cue('s02', 'Dan', 0.9);
  const name = 'DAN COOPER';
  const typed = name.slice(0, Math.max(0, Math.floor((f - nameAt) / 2)));
  return (
    <AbsoluteFill style={{background: C.kraft}}>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - card) * -900}px)`}}>
        <TornPaper x={400} y={640} w={560} h={700} seed={201} rotate={-3}>
          <div style={{position: 'absolute', left: 40, top: 40}}>
            <Man width={480} />
          </div>
        </TornPaper>
        <Tape x={150} y={300} rotate={-40} seed={5} />
        <Tape x={650} y={300} rotate={35} seed={6} />
      </div>
      <Label x={820} y={420} at={cue('s02', 'Costume', 0.02)} text="COSTUME SOMBRE" rotate={4} seed={202} line="M700 450 L520 860" />
      <Label x={740} y={960} at={cue('s02', 'cravate', 0.12)} text="CRAVATE NOIRE À CLIP" rotate={-3} seed={203} line="M680 960 L420 900" />

      {/* plane ticket, torn in two */}
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - ticket) * 700}px)`}}>
        <div style={{position: 'absolute', inset: 0, transform: `translate(${-tear * 30}px, ${tear * 8}px) rotate(${-tear * 3}deg)`}}>
          <TornPaper x={390} y={1450} w={600} h={230} seed={204} rotate={2}>
            <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 44, background: C.red}} />
            <div style={{position: 'absolute', top: 6, left: 24, fontFamily: TITLE, fontSize: 36, color: C.cream, letterSpacing: 3}}>ALLER SIMPLE · VOL 305</div>
            <div style={{position: 'absolute', top: 64, left: 24, fontFamily: TITLE, fontSize: 70, color: C.ink}}>PORTLAND → SEATTLE</div>
            <div style={{position: 'absolute', top: 150, left: 24, fontFamily: TYPE, fontSize: 36, color: C.ink}}>NOM : {typed}</div>
          </TornPaper>
        </div>
        <div style={{position: 'absolute', inset: 0, transform: `translate(${tear * 40}px, ${-tear * 10}px) rotate(${tear * 4}deg)`}}>
          <TornPaper x={860} y={1455} w={240} h={230} seed={205} rotate={2}>
            <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 44, background: C.red}} />
            <div style={{fontFamily: TITLE, fontSize: 110, color: C.ink, textAlign: 'center', marginTop: 70}}>20 $</div>
          </TornPaper>
        </div>
      </div>
      <Counter x={860} y={700} value={20} suffix=" $" start={cue('s02', 'vingt', 0.35)} size={90} />
    </AbsoluteFill>
  );
};
