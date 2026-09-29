import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, Stage, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Counter} from '../components/Counter';
import {cue} from '../data/script';

export const S02: React.FC = () => {
  const f = useStep();
  const typed = 'AU MOINS'.slice(0, Math.max(0, Math.floor((f - 2) / 2)));
  return (
    <AbsoluteFill style={{background: C.kraft}}>
      <Stage>
        <TornPaper x={540} y={420} w={820} h={620} seed={21} rotate={-1}>
          <div style={{position: 'absolute', top: 40, width: '100%', textAlign: 'center', fontFamily: TYPE, fontSize: 60, color: C.ink}}>{typed}</div>
        </TornPaper>
        <Counter x={540} y={320} value={13} suffix=" MEURTRES" start={cue('s02', 'treize', 0.15)} dur={14} size={84} rotate={-4} />
        <Counter x={540} y={480} value={50} suffix=" VIOLS" start={cue('s02', 'cinquante', 0.45)} dur={14} size={84} rotate={3} />
        <Counter x={540} y={640} value={120} suffix=" CAMBRIOLAGES" start={cue('s02', 'cent', 0.7)} dur={16} size={74} rotate={-2} />
      </Stage>
    </AbsoluteFill>
  );
};
