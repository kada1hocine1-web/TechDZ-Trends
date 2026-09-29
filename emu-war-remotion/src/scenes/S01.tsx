import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Farmer, Ground, Wheat} from '../components/Characters';
import {C, Caption, Punch, Sfx, Sky, Stage} from '../components/Meme';
import {cue} from '../data/script';

export const S01: React.FC = () => {
  const f = useCurrentFrame();
  const signAt = cue('s01', 'Occidentale', 0.8);
  const wheatAt = cue('s01', 'blé', 0.65);
  return (
    <AbsoluteFill>
      <Sky />
      <Stage>
        <div style={{position: 'absolute', left: 820, top: 120, width: 170, height: 170, borderRadius: '50%', background: C.yellow, border: `6px solid ${C.ink}`, transform: `rotate(${f}deg)`}} />
        <Ground y={760} />
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${f < wheatAt ? 300 : Math.max(0, 300 - (f - wheatAt) * 30)}px)`}}>
          <Wheat y={780} />
        </div>
        <div style={{position: 'absolute', left: 150, top: 440, transform: `translateY(${-Math.abs(Math.sin(f / 5)) * 18}px)`}}>
          <Farmer size={360} />
        </div>
        <Punch at={signAt} x={720} y={560} size={70} color={C.ink} bg={C.white} rotate={4}>
          AUSTRALIE-OCCIDENTALE
        </Punch>
      </Stage>
      <Caption text="Après la 1re Guerre mondiale" />
      <Caption text="Les vétérans : « enfin la paix »" position="bottom" at={wheatAt} size={80} />
      <Sfx at={signAt} name="pop" />
    </AbsoluteFill>
  );
};
