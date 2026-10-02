import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {C, seeded, Stage, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Stamp} from '../components/Stamp';
import {cue} from '../data/script';

export const S12: React.FC = () => {
  const f = useStep();
  const guiltyAt = cue('s12', 'coupable', 0.2);
  const lifeAt = cue('s12', 'perpétuité', 0.45);
  const closedAt = cue('s12', 'résolu', 0.9);
  const hit = interpolate(f, [guiltyAt - 8, guiltyAt, guiltyAt + 6], [-40, 8, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const k = f - closedAt;
  const r = seeded(Math.floor(f));
  const shake = k >= 0 && k < 10 ? (10 - k) * 1.6 : 0;
  const typed = '2020'.slice(0, Math.max(0, Math.floor((f - 2) / 3)));
  return (
    <AbsoluteFill style={{background: C.ink, transform: `translate(${(r() - 0.5) * shake}px, ${(r() - 0.5) * shake}px)`}}>
      <Stage>
        <TornPaper x={200} y={110} w={260} h={120} seed={1201} rotate={-3}>
          <div style={{fontFamily: TYPE, fontSize: 90, color: C.ink, textAlign: 'center', lineHeight: '120px'}}>{typed}</div>
        </TornPaper>
        {/* gavel */}
        <div style={{position: 'absolute', left: 620, top: 60, transformOrigin: '80% 80%', transform: `rotate(${hit}deg)`}}>
          <svg width={380} height={300}>
            <rect x={40} y={60} width={200} height={90} rx={16} fill="#6b4a2a" stroke={C.cream} strokeWidth={4} />
            <rect x={130} y={140} width={26} height={150} rx={10} fill="#8a6038" stroke={C.cream} strokeWidth={4} transform="rotate(-35 143 150)" />
          </svg>
        </div>
        <div style={{position: 'absolute', left: 560, top: 330, width: 300, height: 40, background: '#6b4a2a', border: `4px solid ${C.cream}`}} />
        {f >= guiltyAt && (
          <TornPaper x={380} y={450} w={640} h={120} seed={1202} rotate={2}>
            <div style={{fontFamily: TITLE, fontSize: 88, color: C.ink, textAlign: 'center', lineHeight: '125px', letterSpacing: 3}}>PLAIDE COUPABLE</div>
          </TornPaper>
        )}
        {f >= lifeAt && (
          <TornPaper x={560} y={620} w={820} h={150} seed={1203} color={C.kraft} rotate={-2}>
            <div style={{fontFamily: TYPE, fontSize: 40, color: C.ink, textAlign: 'center', paddingTop: 22, lineHeight: 1.4}}>
              CONDAMNÉ À PLUSIEURS PEINES
              <br />
              DE PRISON À PERPÉTUITÉ
            </div>
          </TornPaper>
        )}
        <Stamp x={540} y={800} start={closedAt} size={130} rotate={-9} blend="normal">
          AFFAIRE RÉSOLUE
        </Stamp>
      </Stage>
    </AbsoluteFill>
  );
};
