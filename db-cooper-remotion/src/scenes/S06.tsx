import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {C, TITLE, TornPaper, useStep} from '../components/TornPaper';
import {Stamp} from '../components/Stamp';
import {Plane, Parachute} from './S08';
import {Man} from './S02';
import {cue} from '../data/script';

export const S06: React.FC = () => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const bagAt = cue('s06', 'rançon', 0.25);
  const chutesAt = cue('s06', 'parachutes', 0.4);
  const freeAt = cue('s06', 'libère', 0.6);
  const crewAt = cue('s06', 'équipage', 0.85);
  const bag = spring({frame: f - bagAt, fps, config: {damping: 11}});
  const walk = interpolate(f, [freeAt, freeAt + 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: C.night}}>
      {/* tarmac */}
      <TornPaper x={540} y={1300} w={1240} h={900} seed={601} color="#1f252d" rotate={0} shadow jitter={false}>
        {Array.from({length: 7}).map((_, i) => (
          <div key={i} style={{position: 'absolute', top: 260, left: i * 190 - 40, width: 110, height: 16, background: '#d9c46a', opacity: 0.8}} />
        ))}
      </TornPaper>
      <div style={{position: 'absolute', left: 540, top: 820, width: 900, height: 280, transform: 'translateX(-50%)', background: 'radial-gradient(ellipse, rgba(237,227,204,0.18), rgba(0,0,0,0) 70%)'}} />
      <div style={{position: 'absolute', left: 60, top: 470, filter: 'drop-shadow(0 18px 18px rgba(0,0,0,0.6))'}}>
        <Plane width={960} stairs={1} gear blink={false} color="#aeb4b8" />
      </div>

      {/* crew kept on board */}
      {f >= crewAt && (
        <div style={{position: 'absolute', left: 860, top: 575, width: 190, height: 110, border: `8px solid ${C.red}`, borderRadius: '50%', transform: 'rotate(-6deg)'}} />
      )}
      <Stamp x={880} y={430} start={crewAt + 4} size={60} rotate={-6}>
        ÉQUIPAGE
      </Stamp>

      {/* ransom bag */}
      <div style={{position: 'absolute', left: 150, top: 880 - (1 - bag) * 700, opacity: bag > 0.01 ? 1 : 0}}>
        <svg width={200} height={200} viewBox="0 0 200 200" style={{filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))'}}>
          <path d="M60 40 Q100 20 140 40 L150 60 Q195 120 170 180 Q100 200 30 180 Q5 120 50 60 Z" fill={C.kraft} />
          <path d="M55 55 Q100 70 145 55" stroke="#6b5438" strokeWidth={8} fill="none" />
          <text x={100} y={150} textAnchor="middle" fontFamily={TITLE} fontSize={80} fill={C.ink}>$</text>
        </svg>
      </div>
      {/* 4 parachutes */}
      {[0, 1, 2, 3].map((i) => {
        const p = spring({frame: f - chutesAt - i * 4, fps, config: {damping: 12}});
        return (
          <div key={i} style={{position: 'absolute', left: 380 + i * 110, top: 930 - (1 - p) * 700, opacity: p > 0.01 ? 1 : 0}}>
            <div style={{width: 96, height: 110, background: i % 2 ? C.kraft : '#8d7a5c', borderRadius: 16, border: `5px solid ${C.ink}`, position: 'relative'}}>
              <div style={{position: 'absolute', left: 8, top: 10}}>
                <Parachute width={70} open={1} color={C.cream} />
              </div>
            </div>
          </div>
        );
      })}

      {/* passengers leaving and fading */}
      {Array.from({length: 9}).map((_, i) => {
        const x = 210 + i * 80 + walk * 260;
        const o = interpolate(walk, [i * 0.06, i * 0.06 + 0.45], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{position: 'absolute', left: x, top: 1370 + (i % 2) * 30, opacity: o, transform: `translateY(${Math.floor(f / 5 + i) % 2 ? -3 : 0}px)`}}>
            <Man variant="figure" width={56} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
