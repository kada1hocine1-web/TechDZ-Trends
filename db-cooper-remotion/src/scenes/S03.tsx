import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {C, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Tape} from '../components/Tape';
import {cue} from '../data/script';

const WHISPER = 'Mademoiselle, vous feriez mieux de lire ce mot. J\'ai une bombe.';

export const S03: React.FC = () => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const handAt = cue('s03', 'tend', 0.2);
  const unfold = spring({frame: f - handAt, fps, config: {damping: 16}});
  const ignoreAt = cue('s03', 'ignore', 0.35);
  const ignored = spring({frame: f - ignoreAt, fps, config: {damping: 18}});
  const whisperAt = cue('s03', 'murmure', 0.55);
  const bubble = spring({frame: f - whisperAt, fps, config: {damping: 14}});
  const typedAt = cue('s03', 'Mademoiselle', 0.6);
  const typed = WHISPER.slice(0, Math.max(0, Math.floor((f - typedAt) / 1.25)));
  const noteBack = interpolate(f, [typedAt, typedAt + 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const slide = ignored * (1 - noteBack);

  return (
    <AbsoluteFill style={{background: C.ink}}>
      {/* folded note: unfolds, is pushed aside, comes back */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${slide * 380}px, ${slide * 120}px) rotate(${slide * 18}deg)`,
          transformOrigin: '540px 640px',
        }}
      >
        <div style={{position: 'absolute', inset: 0, transform: `scaleY(${0.08 + unfold * 0.92})`, transformOrigin: '540px 640px'}}>
          <TornPaper x={540} y={640} w={640} h={620} seed={301} rotate={-2}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{position: 'absolute', left: 60, right: 60 + (i % 3) * 60, top: 90 + i * 80, height: 4, background: C.ink, opacity: 0.25}} />
            ))}
            <div style={{position: 'absolute', left: 0, right: 0, top: 305, height: 3, background: 'rgba(0,0,0,0.15)'}} />
          </TornPaper>
          <Tape x={250} y={345} rotate={-35} seed={31} />
        </div>
      </div>

      {/* whisper bubble */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${bubble})`, transformOrigin: '160px 1300px', opacity: bubble}}>
        <TornPaper x={540} y={1450} w={900} h={230} seed={302} rotate={1.5}>
          <div style={{padding: '28px 40px', fontFamily: TYPE, fontSize: 44, lineHeight: '58px', color: C.ink}}>
            {typed.split(/(J'ai une bombe\.?)/).map((part, i) => (
              <span key={i} style={{color: part.startsWith("J'ai") ? C.red : C.ink}}>{part}</span>
            ))}
            <span style={{opacity: Math.floor(f / 6) % 2}}>_</span>
          </div>
        </TornPaper>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <path d="M150 1560 L120 1660 L240 1570 Z" fill={C.cream} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
