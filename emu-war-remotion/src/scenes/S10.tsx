import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Emu, Ground, Truck} from '../components/Characters';
import {C, Caption, Punch, seeded, Sfx, Sky, Stage} from '../components/Meme';
import {cue} from '../data/script';

const r = seeded(10);
const CONFETTI = Array.from({length: 70}).map(() => ({x: -420 + r() * 1920, v: 6 + r() * 8, d: r() * 400, c: [C.yellow, C.red, C.white, '#4f7a3a'][Math.floor(r() * 4)], w: r() * 360}));

export const S10: React.FC = () => {
  const f = useCurrentFrame();
  const winAt = cue('s10', 'gagné', 0.6);
  const truckX = interpolate(f, [0, winAt], [420, -700], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Sky />
      <Stage>
        <Ground y={820} />
        <div style={{position: 'absolute', left: truckX, top: 820 - 170}}>
          <Truck width={320} />
        </div>
        {[0, 1, 2, 3, 4].map((i) => {
          const jump = f >= winAt ? Math.abs(Math.sin((f + i * 7) / 5)) * 90 : 0;
          return (
            <div key={i} style={{position: 'absolute', left: 380 + i * 130, top: 820 - 300 - jump}}>
              <Emu size={300} crown={f >= winAt && i === 2} look={-0.6} phase={f >= winAt ? 0 : f / 6 + i} />
            </div>
          );
        })}
        {f >= winAt &&
          CONFETTI.map((c, i) => (
            <div key={i} style={{position: 'absolute', left: c.x + Math.sin((f + i) / 8) * 30, top: -330 + ((f - winAt) * c.v + c.d) % 1900 - 200, width: 18, height: 28, background: c.c, transform: `rotate(${(f + c.w) * 6}deg)`}} />
          ))}
        <Punch at={winAt} x={540} y={300} size={120} bg={C.yellow} color={C.ink} rotate={-5}>
          Victoire des émeus
        </Punch>
      </Stage>
      <Caption text="L'armée se retire" />
      <Caption text="GG les émeus" position="bottom" at={winAt + 10} />
      <Sfx at={winAt} name="fanfare" volume={0.7} />
    </AbsoluteFill>
  );
};
