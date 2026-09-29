import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {C, seeded, Stage, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Stamp} from '../components/Stamp';
import {cue} from '../data/script';

const Bag: React.FC<{x: number; y: number; at: number; label: string; seed: number; rot: number; children: React.ReactNode}> = ({x, y, at, label, seed, rot, children}) => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - at, fps, config: {damping: 14}});
  if (f < at) return null;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - p) * -700}px)`}}>
      <TornPaper x={x} y={y} w={400} h={400} seed={seed} color="rgba(225,232,238,0.9)" rotate={rot}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 40, background: C.red}} />
        <div style={{position: 'absolute', left: 16, top: 4, fontFamily: TITLE, fontSize: 32, color: C.cream, letterSpacing: 3}}>PREUVE</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 60, display: 'flex', justifyContent: 'center'}}>{children}</div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 20, textAlign: 'center', fontFamily: TYPE, fontSize: 30, color: C.ink}}>{label}</div>
      </TornPaper>
    </div>
  );
};

const r = seeded(1111);
const BARS = Array.from({length: 26}).map(() => 6 + r() * 16);

const Barcode: React.FC<{color: string}> = ({color}) => (
  <svg width={620} height={60}>
    {BARS.map((w, i) => (
      <rect key={i} x={i * 23.5} y={0} width={w * 0.8} height={60} fill={color} />
    ))}
  </svg>
);

export const S11: React.FC = () => {
  const f = useStep();
  const matchAt = cue('s11', 'Correspondance', 0.8);
  const slide = interpolate(f, [matchAt - 10, matchAt + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.kraft}}>
      <Stage>
        <Bag x={280} y={290} at={cue('s11', 'mouchoir', 0.3)} label="MOUCHOIR JETÉ" seed={1101} rot={-4}>
          <svg width={230} height={220}>
            <path d="M40 150 Q20 80 80 60 Q110 20 150 60 Q210 70 190 140 Q200 190 130 190 Q60 200 40 150 Z" fill="#fbfbf7" stroke="#b9b9b0" strokeWidth={4} />
            <path d="M80 100 Q110 120 150 95 M90 150 Q120 130 160 150" stroke="#cfcfc5" strokeWidth={4} fill="none" />
          </svg>
        </Bag>
        <Bag x={800} y={310} at={cue('s11', 'poignée', 0.55)} label="POIGNÉE DE PORTIÈRE" seed={1102} rot={4}>
          <svg width={260} height={220}>
            <rect x={10} y={40} width={240} height={150} rx={20} fill="#5a6a7a" />
            <rect x={40} y={96} width={180} height={40} rx={20} fill="#c9d1d8" stroke={C.ink} strokeWidth={4} />
            <rect x={60} y={106} width={140} height={20} rx={10} fill="#8d98a2" />
          </svg>
        </Bag>
        {f >= matchAt - 10 && (
          <TornPaper x={540} y={630} w={700} h={190} seed={1103} rotate={-1}>
            <div style={{position: 'absolute', left: 40, top: 30, transform: `translateX(${-slide * 300}px)`}}>
              <Barcode color={C.ink} />
            </div>
            <div style={{position: 'absolute', left: 40, top: 100, transform: `translateX(${slide * 300}px)`, opacity: 0.85}}>
              <Barcode color={C.red} />
            </div>
          </TornPaper>
        )}
        <Stamp x={540} y={800} start={matchAt + 12} size={66} rotate={-7} blend="normal">
          CORRESPONDANCE PARFAITE
        </Stamp>
      </Stage>
    </AbsoluteFill>
  );
};
