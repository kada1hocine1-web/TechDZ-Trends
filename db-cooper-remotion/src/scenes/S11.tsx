import React from 'react';
import {AbsoluteFill, spring, useVideoConfig} from 'remotion';
import {C, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Stamp} from '../components/Stamp';
import {Man} from './S02';
import {Bill} from './S05';
import {Parachute} from './S08';
import {cue} from '../data/script';

const Card: React.FC<{x: number; y: number; rot: number; seed: number; label: string; at: number; children: React.ReactNode}> = ({x, y, rot, seed, label, at, children}) => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const q = spring({frame: f - at, fps, config: {damping: 10, stiffness: 180}});
  return (
    <>
      <TornPaper x={x} y={y} w={300} h={380} seed={seed} rotate={rot}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - q * 0.6}}>{children}</div>
        <div style={{position: 'absolute', bottom: 16, width: '100%', textAlign: 'center', fontFamily: TYPE, fontSize: 30, color: C.ink}}>{label}</div>
      </TornPaper>
      {f >= at && (
        <TornPaper x={x + 70} y={y - 110} w={130} h={170} seed={seed + 50} color={C.red} rotate={rot * -2} style={{transform: `scale(${q})`}}>
          <div style={{fontFamily: TITLE, fontSize: 190, color: C.cream, textAlign: 'center', lineHeight: '180px'}}>?</div>
        </TornPaper>
      )}
    </>
  );
};

export const S11: React.FC = () => (
  <AbsoluteFill style={{background: C.ink}}>
    <Card x={540} y={470} rot={-2} seed={1101} label="L'HOMME" at={cue('s11', 'pirate', 0.3)}>
      <Man width={250} />
    </Card>
    <Card x={250} y={860} rot={-4} seed={1102} label="L'ARGENT" at={cue('s11', 'argent', 0.6)}>
      <div style={{transform: 'rotate(-10deg)'}}>
        <Bill width={240} />
      </div>
    </Card>
    <Card x={830} y={860} rot={4} seed={1103} label="LE PARACHUTE" at={cue('s11', 'parachute', 0.85)}>
      <Parachute width={220} open={1} color={C.kraft} />
    </Card>
    <Stamp x={540} y={1460} start={cue('s11', 'aucune', 0.05)} size={110} rotate={-4} blend="normal">
      AUCUNE TRACE
    </Stamp>
  </AbsoluteFill>
);
