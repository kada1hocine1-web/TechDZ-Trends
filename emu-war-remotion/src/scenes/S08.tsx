import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Newspaper} from '../components/Characters';
import {C, Caption, Sfx, Stage} from '../components/Meme';
import {cue} from '../data/script';

const PAPERS = [
  {title: 'FIASCO !', x: 280, y: 330, rot: -12, d: 0},
  {title: 'ÉCHEC TOTAL', x: 760, y: 420, rot: 9, d: 8},
  {title: 'RIDICULE', x: 470, y: 720, rot: -4, d: 16},
];

export const S08: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pressAt = cue('s08', 'presse', 0.55);
  return (
    <AbsoluteFill style={{background: `repeating-conic-gradient(${C.skyDeep} 0 15deg, ${C.sky} 15deg 30deg)`, backgroundPosition: 'center'}}>
      <Stage>
        {PAPERS.map((p, i) => {
          const s = spring({frame: f - pressAt + 6 - p.d, fps, config: {damping: 12}});
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: p.x,
                top: p.y,
                transform: `translate(-50%, -50%) rotate(${p.rot + (1 - s) * 540}deg) scale(${s})`,
              }}
            >
              <Newspaper title={p.title} />
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 540, top: 540, transform: `translate(-50%, -50%) rotate(${f * 4}deg)`, opacity: f < pressAt - 6 ? 1 : 0}}>
          <div style={{width: 300, height: 300, borderRadius: '50%', border: `14px solid ${C.white}`, borderTopColor: C.ink}} />
        </div>
      </Stage>
      <Caption text="Des semaines plus tard" />
      <Caption text="La presse :" position="bottom" at={pressAt} />
      {PAPERS.map((p, i) => (
        <Sfx key={i} at={pressAt - 6 + p.d} name="whoosh" volume={0.5} />
      ))}
    </AbsoluteFill>
  );
};
