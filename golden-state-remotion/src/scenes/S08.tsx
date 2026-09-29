import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {C, seeded, Stage, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {cue} from '../data/script';

const r = seeded(808);
const USERS = Array.from({length: 12}).map((_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return {x: 540 + Math.cos(a) * (420 + r() * 40), y: 400 + Math.sin(a) * (300 + r() * 30), d: i * 3};
});

export const S08: React.FC = () => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const upAt = cue('s08', 'téléversent', 0.05);
  const usersAt = cue('s08', 'amateurs', 0.6);
  const up = interpolate(f, [upAt, upAt + 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.night}}>
      <Stage>
        <svg width={1080} height={1080} style={{position: 'absolute', inset: 0}}>
          {USERS.map((u, i) => (f >= usersAt + u.d ? <line key={i} x1={540} y1={400} x2={u.x} y2={u.y} stroke={C.red} strokeWidth={3} strokeDasharray="10 8" /> : null))}
        </svg>
        {/* monitor */}
        <TornPaper x={540} y={390} w={620} h={440} seed={81} color={C.cream} rotate={-1}>
          <div style={{position: 'absolute', left: 26, top: 26, right: 26, bottom: 26, background: '#0d1b2a', padding: 26, boxSizing: 'border-box'}}>
            <div style={{fontFamily: TITLE, fontSize: 84, color: C.cream, letterSpacing: 4}}>GEDMATCH</div>
            <div style={{fontFamily: TYPE, fontSize: 24, color: C.kraft, marginTop: 6}}>BASE DE DONNÉES GÉNÉALOGIQUE PUBLIQUE</div>
            <div style={{fontFamily: TYPE, fontSize: 26, color: C.cream, marginTop: 50}}>TÉLÉVERSEMENT ADN… {Math.round(up * 100)} %</div>
            <div style={{marginTop: 16, height: 30, border: `3px solid ${C.cream}`}}>
              <div style={{height: '100%', width: `${up * 100}%`, background: C.red}} />
            </div>
          </div>
        </TornPaper>
        <div style={{position: 'absolute', left: 490, top: 620, width: 100, height: 60, background: C.cream}} />
        {USERS.map((u, i) => {
          const p = spring({frame: f - usersAt - u.d, fps, config: {damping: 12}});
          return f >= usersAt + u.d ? (
            <div key={i} style={{position: 'absolute', left: u.x - 36, top: u.y - 36, transform: `scale(${p})`}}>
              <svg width={72} height={72}>
                <circle cx={36} cy={36} r={34} fill={C.cream} stroke={C.ink} strokeWidth={3} />
                <circle cx={36} cy={28} r={11} fill={C.ink} />
                <path d="M16 60 Q36 36 56 60 Z" fill={C.ink} />
              </svg>
            </div>
          ) : null;
        })}
        {f >= usersAt + 20 && (
          <TornPaper x={540} y={770} w={620} h={90} seed={82} color={C.kraft} rotate={2}>
            <div style={{fontFamily: TYPE, fontSize: 36, color: C.ink, textAlign: 'center', lineHeight: '100px'}}>AMATEURS · PARENTS ÉLOIGNÉS</div>
          </TornPaper>
        )}
      </Stage>
    </AbsoluteFill>
  );
};
