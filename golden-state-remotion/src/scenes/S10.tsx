import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {C, seeded, Stage, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Stamp} from '../components/Stamp';
import {Tape} from '../components/Tape';
import {Person} from './S09';
import {cue} from '../data/script';

const r = seeded(1010);
const CROWD = Array.from({length: 30}).map((_, i) => ({x: 80 + (i % 10) * 102, y: 120 + Math.floor(i / 10) * 120, out: r()}));

export const S10: React.FC = () => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const nameAt = cue('s10', 'Joseph', 0.3);
  const narrow = interpolate(f, [0, nameAt], [0, 1], {extrapolateRight: 'clamp'});
  const card = spring({frame: f - nameAt, fps, config: {damping: 14}});
  const ageAt = cue('s10', 'soixante-douze', 0.8);
  const copAt = cue('s10', 'policier', 0.7);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Stage>
        {CROWD.map((p, i) => (p.out > narrow || i === 14 ? <Person key={i} x={p.x} y={p.y} seed={1100 + i} hl={i === 14 && narrow > 0.9} /> : null))}
        {f >= nameAt && (
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - card) * 700}px)`}}>
            <TornPaper x={540} y={620} w={820} h={360} seed={1020} rotate={-1.5}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 44, background: C.red}} />
              <div style={{position: 'absolute', left: 24, top: 6, fontFamily: TITLE, fontSize: 38, color: C.cream, letterSpacing: 3}}>SUSPECT IDENTIFIÉ</div>
              <div style={{position: 'absolute', left: 40, top: 80, fontFamily: TITLE, fontSize: 84, color: C.ink, lineHeight: 1, whiteSpace: 'nowrap'}}>JOSEPH JAMES DeANGELO</div>
              <div style={{position: 'absolute', left: 40, top: 190, fontFamily: TYPE, fontSize: 40, color: C.ink, lineHeight: 1.5}}>
                {f >= ageAt ? 'ÂGE : 72 ANS' : ''}
                <br />
                {f >= copAt ? 'ANCIEN POLICIER' : ''}
              </div>
            </TornPaper>
            <Tape x={150} y={450} rotate={-35} seed={3} />
            <Tape x={930} y={790} rotate={-30} seed={4} />
          </div>
        )}
        <Stamp x={780} y={330} start={Math.max(ageAt, copAt) + 10} size={80} rotate={-10} blend="normal">
          UN SEUL NOM
        </Stamp>
      </Stage>
    </AbsoluteFill>
  );
};
