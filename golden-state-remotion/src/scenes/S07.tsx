import React from 'react';
import {AbsoluteFill, spring, useVideoConfig} from 'remotion';
import {C, Stage, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Tape} from '../components/Tape';
import {Helix} from './S06';
import {cue} from '../data/script';

const IdCard: React.FC<{x: number; y: number; at: number; name: string; role: string; seed: number; rot: number}> = ({x, y, at, name, role, seed, rot}) => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - at, fps, config: {damping: 14}});
  if (f < at) return null;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - p) * 700}px)`}}>
      <TornPaper x={x} y={y} w={520} h={190} seed={seed} rotate={rot}>
        <svg width={120} height={150} style={{position: 'absolute', left: 20, top: 20}}>
          <rect width={120} height={150} fill={C.kraft} />
          <circle cx={60} cy={55} r={30} fill={C.ink} opacity={0.75} />
          <path d="M15 150 Q60 80 105 150 Z" fill={C.ink} opacity={0.75} />
        </svg>
        <div style={{position: 'absolute', left: 160, top: 34, right: 16, fontFamily: TITLE, fontSize: 46, lineHeight: 1, color: C.ink, whiteSpace: 'nowrap'}}>{name}</div>
        <div style={{position: 'absolute', left: 160, top: 100, right: 16, fontFamily: TYPE, fontSize: 24, color: C.red}}>{role}</div>
      </TornPaper>
    </div>
  );
};

export const S07: React.FC = () => {
  const f = useStep();
  const typed = '2018'.slice(0, Math.max(0, Math.floor((f - 2) / 3)));
  const dnaAt = cue('s07', 'ADN', 0.7);
  return (
    <AbsoluteFill style={{background: C.kraft}}>
      <Stage>
        <TornPaper x={200} y={110} w={260} h={120} seed={71} rotate={-3}>
          <div style={{fontFamily: TYPE, fontSize: 90, color: C.ink, textAlign: 'center', lineHeight: '120px'}}>{typed}</div>
        </TornPaper>
        <IdCard x={320} y={320} at={cue('s07', 'Paul', 0.2)} name="PAUL HOLES" role="ENQUÊTEUR" seed={72} rot={-2} />
        <IdCard x={740} y={480} at={cue('s07', 'Barbara', 0.45)} name="BARBARA RAE-VENTER" role="GÉNÉALOGISTE GÉNÉTIQUE" seed={73} rot={3} />
        {f >= dnaAt && (
          <>
            <TornPaper x={500} y={710} w={640} h={230} seed={74} color="rgba(236,240,244,0.92)" rotate={-2}>
              <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 36, background: C.red}} />
              <div style={{position: 'absolute', left: 20, top: 2, fontFamily: TITLE, fontSize: 32, color: C.cream, letterSpacing: 3}}>PIÈCE À CONVICTION</div>
              <div style={{position: 'absolute', left: 20, top: 60, fontFamily: TYPE, fontSize: 36, color: C.ink, lineHeight: 1.3}}>
                ADN
                <br />
                SCÈNE DE CRIME — 1980
              </div>
              <div style={{position: 'absolute', right: 30, top: 50}}>
                <Helix width={70} height={160} frame={f} />
              </div>
            </TornPaper>
            <Tape x={230} y={620} rotate={-35} seed={7} />
          </>
        )}
      </Stage>
    </AbsoluteFill>
  );
};
