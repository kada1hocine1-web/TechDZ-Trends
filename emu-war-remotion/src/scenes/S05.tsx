import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Emu} from '../components/Characters';
import {C, Caption, Sfx, Stage, usePop, useShake} from '../components/Meme';
import {cue} from '../data/script';

export const S05: React.FC = () => {
  const f = useCurrentFrame();
  const at = cue('s05', 'sous-estimé', 0.5);
  const pop = usePop(at, 300);
  const shake = useShake(at, 24);
  const zoom = f < at ? interpolate(f, [0, at], [1, 1.15]) : interpolate(pop, [0, 1], [1.15, 1.9]);
  return (
    <AbsoluteFill style={{transform: shake, background: f >= at ? `radial-gradient(circle, #ff4d4d, ${C.red} 45%, #5a0000)` : `radial-gradient(circle, #8fd3ff, ${C.skyDeep})`}}>
      <Stage>
        <div style={{position: 'absolute', left: 540, top: 1080, transform: `translate(-50%, -100%) scale(${zoom})`, transformOrigin: '72% 12%'}}>
          <Emu size={1000} look={-0.3} />
        </div>
      </Stage>
      <Caption text="Spoiler :" />
      <Caption text="Ils ont sous-estimé l'ennemi" position="bottom" at={at} />
      <Sfx at={at} name="boom" volume={0.8} />
    </AbsoluteFill>
  );
};
