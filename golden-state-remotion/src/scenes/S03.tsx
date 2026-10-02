import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {C, Stage, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {cue} from '../data/script';

const ALIASES = [
  {name: 'EAST AREA RAPIST', needle: 'East', y: 170, rot: -3},
  {name: 'ORIGINAL NIGHT STALKER', needle: 'Original', y: 360, rot: 2},
];

export const S03: React.FC = () => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const goldAt = cue('s03', 'Golden', 0.85);
  const gold = spring({frame: f - goldAt, fps, config: {damping: 11, stiffness: 180}});
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Stage>
        {ALIASES.map((a, i) => {
          const at = cue('s03', a.needle, 0.2 + i * 0.3);
          const p = spring({frame: f - at, fps, config: {damping: 14}});
          const next = i === 0 ? cue('s03', 'Original', 0.5) : goldAt;
          const strike = interpolate(f, [next, next + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          if (f < at) return null;
          return (
            <div key={a.name} style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - p) * -900}px)`}}>
              <TornPaper x={540} y={a.y} w={820} h={130} seed={31 + i} rotate={a.rot}>
                <div style={{fontFamily: TYPE, fontSize: 30, color: C.ink, position: 'absolute', left: 24, top: 10, opacity: 0.7}}>ALIAS N° {i + 1}</div>
                <div style={{fontFamily: TITLE, fontSize: 80, color: C.ink, textAlign: 'center', lineHeight: '150px'}}>{a.name}</div>
                <div style={{position: 'absolute', left: 30, top: 66, height: 10, width: `${strike * 92}%`, background: C.red}} />
              </TornPaper>
            </div>
          );
        })}
        {f >= goldAt && (
          <div style={{position: 'absolute', inset: 0, transform: `scale(${interpolate(gold, [0, 1], [2.2, 1])})`, transformOrigin: '540px 640px', opacity: Math.min(1, gold * 3)}}>
            <TornPaper x={540} y={640} w={960} h={240} seed={33} color={C.red} rotate={-2}>
              <div style={{fontFamily: TYPE, fontSize: 32, color: C.cream, position: 'absolute', left: 24, top: 12}}>ALIAS N° 3</div>
              <div style={{fontFamily: TITLE, fontSize: 118, color: C.cream, textAlign: 'center', lineHeight: '270px', letterSpacing: 2}}>GOLDEN STATE KILLER</div>
            </TornPaper>
          </div>
        )}
      </Stage>
    </AbsoluteFill>
  );
};
