import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Emu, Ground, LewisGun, Soldier} from '../components/Characters';
import {C, Caption, count, fr, Punch, seeded, Sfx, Sky, Stage, useShake} from '../components/Meme';
import {cue} from '../data/script';

const r = seeded(1000);
const FLOCK = Array.from({length: 40}).map(() => ({x: 380 + r() * 700, y: 560 + r() * 360, s: 90 + r() * 60, p: r() * 6}));

export const S07: React.FC = () => {
  const f = useCurrentFrame();
  const thousandAt = cue('s07', 'mille', 0.3);
  const jamAt = cue('s07', 'enraye', 0.6);
  const dozenAt = cue('s07', 'douzaine', 0.85);
  const shake = useShake(jamAt, 22);
  return (
    <AbsoluteFill style={{transform: shake}}>
      <Sky />
      <Stage>
        <Ground y={560} color="#C98A4F" />
        {/* dam */}
        <div style={{position: 'absolute', left: 520, top: 640, width: 520, height: 200, borderRadius: '50%', background: C.water, border: `6px solid ${C.ink}`}} />
        {FLOCK.map((e, i) => (
          <div key={i} style={{position: 'absolute', left: e.x, top: e.y - e.s, zIndex: Math.round(e.y)}}>
            <Emu size={e.s} phase={f / 5 + e.p} flip={i % 2 === 0} look={Math.sin(f / 10 + i)} />
          </div>
        ))}
        {/* ambush bush */}
        <div style={{position: 'absolute', left: -160, top: 720, width: 560, height: 260, borderRadius: '50% 50% 0 0', background: '#4f7a3a', border: `6px solid ${C.ink}`, zIndex: 3000}} />
        <div style={{position: 'absolute', left: 20, top: 620, zIndex: 2999}}>
          <Soldier size={240} scared={f >= jamAt} />
        </div>
        <div style={{position: 'absolute', left: 60, top: 760, zIndex: 3001}}>
          <LewisGun width={360} firing={f < jamAt && f > thousandAt} jammed={f >= jamAt} frame={f} />
        </div>
        <Punch at={thousandAt} x={780} y={190} size={100}>
          {fr(count(f, thousandAt, 20, 1000))} émeus
        </Punch>
        <Punch at={jamAt} x={260} y={480} size={110} color={C.red} rotate={-10}>
          Enrayée
        </Punch>
        <Punch at={dozenAt} x={720} y={340} size={70} bg={C.white} color={C.ink} rotate={3}>
          Score : 12 / 1 000
        </Punch>
      </Stage>
      <Caption text="Embuscade près d'un barrage" />
      <Caption text="Échec critique" position="bottom" at={dozenAt + 10} />
      <Sfx at={thousandAt + 6} name="gun" volume={0.45} />
      <Sfx at={jamAt} name="clank" volume={0.8} />
      <Sfx at={dozenAt} name="sad" volume={0.6} />
    </AbsoluteFill>
  );
};
