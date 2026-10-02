import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Emu, Farmer, Ground} from '../components/Characters';
import {C, Caption, Punch, Sfx, Sky, Stage, usePop} from '../components/Meme';
import {cue} from '../data/script';

export const S03: React.FC = () => {
  const f = useCurrentFrame();
  const bigAt = cue('s03', 'énormes', 0.35);
  const callAt = cue('s03', 'appellent', 0.75);
  const call = f >= callAt;
  const zoom = usePop(callAt);
  return (
    <AbsoluteFill>
      <Sky />
      <Stage>
        <Ground y={800} />
        {!call ? (
          <>
            {/* speed lines */}
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} style={{position: 'absolute', left: ((i * 173 - f * 60) % 1500) + 900 - 1500 + 600, top: 520 + i * 36, width: 220, height: 8, background: C.white, opacity: 0.8}} />
            ))}
            {[0, 1, 2].map((i) => {
              const x = ((f * 38 + i * 420) % 1700) - 400;
              return (
                <div key={i} style={{position: 'absolute', left: 1080 - x, top: 800 - 330}}>
                  <Emu size={330} phase={f / 1.6 + i} flip look={1} />
                </div>
              );
            })}
            <div style={{position: 'absolute', left: interpolate(f, [0, callAt], [700, 300]), top: 520, transform: `rotate(${Math.sin(f / 2) * 6}deg)`}}>
              <Farmer size={300} mood="angry" />
            </div>
            <Punch at={bigAt} x={540} y={250} size={100}>
              Trop gros.
            </Punch>
            <Punch at={bigAt + 12} x={560} y={380} size={100} rotate={4}>
              Trop rapides.
            </Punch>
          </>
        ) : (
          <div style={{position: 'absolute', left: 540, top: 800, transform: `translate(-50%, -100%) scale(${interpolate(zoom, [0, 1], [1, 1.6])})`, transformOrigin: '50% 100%'}}>
            <Farmer size={420} mood="phone" />
          </div>
        )}
      </Stage>
      <Caption text="Les fermiers vs les émeus" />
      <Caption text="« Allô, l'armée ? »" position="bottom" at={callAt} />
      <Sfx at={bigAt} name="whoosh" />
      <Sfx at={callAt} name="boom" />
    </AbsoluteFill>
  );
};
