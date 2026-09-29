import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Emu, Ground, Soldier} from '../components/Characters';
import {C, Caption, FONT, Punch, Sfx, Sky, Stage, usePop, useShake} from '../components/Meme';
import {cue} from '../data/script';

export const S09: React.FC = () => {
  const f = useCurrentFrame();
  const quoteAt = cue('s09', 'avec', 0.55);
  const tankAt = cue('s09', 'chars', 0.85);
  const bubble = usePop(quoteAt);
  const shake = useShake(tankAt, 26, 16);
  const tankX = interpolate(f, [tankAt - 20, tankAt + 10], [1400, 640], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{transform: shake}}>
      <Sky />
      <Stage>
        <Ground y={860} color="#C9743F" />
        <div style={{position: 'absolute', left: 40, top: 860 - 440}}>
          <Soldier size={440} officer scared={f >= tankAt} />
        </div>
        <Punch at={0} x={200} y={900} size={40} bg={C.yellow} color={C.ink} rotate={-3}>
          Major Meredith
        </Punch>
        {f >= quoteAt && (
          <div
            style={{
              position: 'absolute',
              left: 300,
              top: 120,
              width: 700,
              padding: '26px 34px',
              background: C.white,
              border: `6px solid ${C.ink}`,
              borderRadius: 40,
              fontFamily: FONT,
              fontSize: 54,
              lineHeight: 1.1,
              color: C.ink,
              textAlign: 'center',
              transform: `scale(${bubble})`,
              transformOrigin: '10% 100%',
            }}
          >
            « AVEC L'INVULNÉRABILITÉ DES CHARS D'ASSAUT »
          </div>
        )}
        <div style={{position: 'absolute', left: tankX, top: 860 - 420}}>
          <Emu size={420} tank look={-1} flip />
        </div>
      </Stage>
      <Caption text="Le major, honnête :" />
      <Caption text="L'émeu, char d'assaut" position="bottom" at={tankAt + 8} />
      <Sfx at={quoteAt} name="pop" />
      <Sfx at={tankAt} name="boom" volume={0.8} />
    </AbsoluteFill>
  );
};
