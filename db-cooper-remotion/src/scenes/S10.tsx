import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {C, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Counter} from '../components/Counter';
import {Bill} from './S05';
import {cue} from '../data/script';

const BILLS = [
  {x: 210, rot: -14, d: 0},
  {x: 470, rot: 8, d: 6},
  {x: 720, rot: -5, d: 12},
];

export const S10: React.FC = () => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const year = '1980';
  const typed = year.slice(0, Math.max(0, Math.floor((f - 4) / 3)));
  const riverAt = cue('s10', 'Columbia', 0.4);
  const billsAt = cue('s10', 'paquet', 0.6);
  const moneyAt = cue('s10', 'cinq', 0.8);
  const label = spring({frame: f - riverAt, fps, config: {damping: 14}});

  return (
    <AbsoluteFill style={{background: C.kraft}}>
      {/* river */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 700, background: '#2c4a63'}} />
      {[0, 1, 2, 3].map((i) => (
        <TornPaper
          key={i}
          x={540 + ((f * (1 + i * 0.3)) % 120) - 60}
          y={330 + i * 95}
          w={1300}
          h={34}
          seed={1000 + i}
          color={i % 2 ? '#4d7390' : '#3b6080'}
          shadow={false}
          rough={8}
        />
      ))}
      {/* sand bank */}
      <TornPaper x={540} y={1200} w={1240} h={1000} seed={1010} color="#d9c29a" rough={22} />
      {Array.from({length: 60}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: (i * 173) % 1080, top: 760 + ((i * 97) % 300), width: 6, height: 6, borderRadius: 3, background: '#a88c62', opacity: 0.7}} />
      ))}

      <TornPaper x={300} y={300} w={380} h={130} seed={1020} rotate={-4}>
        <div style={{fontFamily: TYPE, fontSize: 100, color: C.ink, textAlign: 'center', lineHeight: '130px'}}>{typed}</div>
      </TornPaper>
      <TornPaper x={700} y={560} w={560} h={90} seed={1021} rotate={2} style={{opacity: label}}>
        <div style={{fontFamily: TITLE, fontSize: 64, color: C.ink, textAlign: 'center', lineHeight: '92px', letterSpacing: 3}}>FLEUVE COLUMBIA</div>
      </TornPaper>

      {/* decomposed bills rising out of the sand */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, height: 360, overflow: 'hidden'}}>
        {BILLS.map((b, i) => {
          const p = spring({frame: f - billsAt - b.d, fps, config: {damping: 20, stiffness: 50}});
          return (
            <div key={i} style={{position: 'absolute', left: b.x - 150, top: interpolate(p, [0, 1], [360, 120 + i * 30]), transform: `rotate(${b.rot}deg)`, filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))'}}>
              <TornPaper x={150} y={65} w={300} h={130} seed={1030 + i} color="#b5a57a" rough={22} jitter={false}>
                <Bill width={300} decay={1} />
              </TornPaper>
            </div>
          );
        })}
      </div>
      <Counter x={540} y={1460} value={5800} prefix="1980 — " suffix=" $" start={moneyAt} dur={30} size={84} rotate={-4} />
    </AbsoluteFill>
  );
};
