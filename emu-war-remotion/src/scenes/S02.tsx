import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Emu, Farmer, Ground, Wheat} from '../components/Characters';
import {C, Caption, count, fr, Punch, seeded, Sfx, Sky, Stage, useShake} from '../components/Meme';
import {cue} from '../data/script';

const r = seeded(20);
const HORDE = Array.from({length: 22}).map(() => ({x: r() * 1500, y: 640 + r() * 260, s: 170 + r() * 90, d: r() * 20}));

export const S02: React.FC = () => {
  const f = useCurrentFrame();
  const emusAt = cue('s02', 'vingt', 0.25);
  const eatAt = cue('s02', 'ravagent', 0.7);
  const shake = useShake(emusAt);
  const eaten = interpolate(f, [eatAt, eatAt + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{transform: shake}}>
      <Sky />
      <Stage>
        <Ground y={760} />
        <Wheat y={780} eaten={eaten} />
        <div style={{position: 'absolute', left: 60, top: 480}}>
          <Farmer size={300} mood={f >= eatAt ? 'angry' : 'happy'} />
        </div>
        {HORDE.map((e, i) => {
          const x = interpolate(f - emusAt - e.d, [0, 40], [1500 + e.x * 0.3, 250 + e.x * 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{position: 'absolute', left: x, top: e.y - e.s, zIndex: Math.round(e.y)}}>
              <Emu size={e.s} phase={(f + i * 3) / 2.2} flip look={-0.8} />
            </div>
          );
        })}
        <Punch at={emusAt + 4} x={540} y={300} size={130}>
          {fr(count(f, emusAt + 4, 30, 20000))} ÉMEUS
        </Punch>
      </Stage>
      <Caption text="Petit problème" />
      <Caption text="Ils ont faim." position="bottom" at={eatAt} />
      <Sfx at={emusAt} name="boom" />
      <Sfx at={eatAt} name="whoosh" />
    </AbsoluteFill>
  );
};
