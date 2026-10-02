import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, seeded, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Stamp} from '../components/Stamp';
import {Tape} from '../components/Tape';
import {Man} from './S02';
import {Plane} from './S08';
import {cue} from '../data/script';

export const S12: React.FC = () => {
  const f = useStep();
  const slam = cue('s12', 'élucidé', 0.6);
  const k = f - slam;
  const r = seeded(Math.floor(f));
  const shake = k >= 0 && k < 10 ? (10 - k) * 1.6 : 0;
  return (
    <AbsoluteFill style={{background: C.ink, transform: `translate(${(r() - 0.5) * shake}px, ${(r() - 0.5) * shake}px)`}}>
      <TornPaper x={540} y={660} w={860} h={780} seed={1201} color={C.kraft} rotate={2} />
      <TornPaper x={430} y={610} w={420} h={520} seed={1202} rotate={-4}>
        <div style={{position: 'absolute', left: 10, top: 20}}>
          <Man width={400} />
        </div>
      </TornPaper>
      <TornPaper x={760} y={900} w={360} h={150} seed={1203} rotate={5}>
        <div style={{position: 'absolute', left: 20, top: 30}}>
          <Plane width={320} />
        </div>
      </TornPaper>
      <TornPaper x={760} y={380} w={300} h={80} seed={1204} rotate={3}>
        <div style={{fontFamily: TYPE, fontSize: 36, color: C.ink, textAlign: 'center', lineHeight: '80px'}}>D.B. COOPER</div>
      </TornPaper>
      <Tape x={260} y={360} rotate={-35} seed={121} />
      <Tape x={900} y={1030} rotate={-30} seed={122} />
      <Stamp x={540} y={700} start={slam} size={170} rotate={-12}>
        NON ÉLUCIDÉ
      </Stamp>
      <TornPaper x={540} y={1470} w={760} h={110} seed={1205} rotate={-1}>
        <div style={{fontFamily: TITLE, fontSize: 64, color: C.ink, textAlign: 'center', lineHeight: '112px', letterSpacing: 4}}>AFFAIRE NORJAK</div>
      </TornPaper>
    </AbsoluteFill>
  );
};
