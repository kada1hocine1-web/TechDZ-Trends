import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Ground, LewisGun, Soldier} from '../components/Characters';
import {C, Caption, count, fr, Punch, Sfx, Sky, Stage} from '../components/Meme';
import {cue} from '../data/script';

export const S04: React.FC = () => {
  const f = useCurrentFrame();
  const gunAt = cue('s04', 'Lewis', 0.4);
  const ammoAt = cue('s04', 'dix', 0.6);
  const majorAt = cue('s04', 'major', 0.8);
  const march = interpolate(f, [0, 40], [-700, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Sky />
      <Stage>
        <Ground y={820} color="#C9743F" />
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${march}px)`}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{position: 'absolute', left: 60 + i * 150, top: 820 - 320, transform: `translateY(${f < 40 ? -Math.abs(Math.sin(f / 4 + i)) * 14 : 0}px)`}}>
              <Soldier size={320} officer={i === 0} />
            </div>
          ))}
        </div>
        {f >= gunAt && (
          <div style={{position: 'absolute', left: 480, top: 660, transform: `scale(${interpolate(f, [gunAt, gunAt + 8], [0, 1], {extrapolateRight: 'clamp'})})`}}>
            <LewisGun width={440} />
          </div>
        )}
        {f >= ammoAt &&
          [0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{position: 'absolute', left: 800 + (i % 2) * 130, top: 800 - 70 - Math.floor(i / 2) * 70 - Math.max(0, 300 - (f - ammoAt - i * 3) * 40), width: 120, height: 66, background: '#6b5a2a', border: `5px solid ${C.ink}`, zIndex: 5, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 50px, #4a3a1a 50px 58px)'}}>
            </div>
          ))}
        <Punch at={gunAt} x={740} y={570} size={60} bg={C.white} color={C.ink} rotate={-3}>
          Mitrailleuses Lewis
        </Punch>
        <Punch at={ammoAt} x={540} y={250} size={100}>
          {fr(count(f, ammoAt, 25, 10000))} cartouches
        </Punch>
        <Punch at={majorAt} x={330} y={430} size={48} bg={C.yellow} color={C.ink} rotate={5}>
          Major G.P.W. Meredith
        </Punch>
      </Stage>
      <Caption text="L'armée entre dans le chat" />
      <Caption text="Artillerie royale australienne" position="bottom" at={10} size={70} />
      <Sfx at={gunAt} name="pop" />
      <Sfx at={ammoAt} name="pop" />
      <Sfx at={majorAt} name="boom" />
    </AbsoluteFill>
  );
};
