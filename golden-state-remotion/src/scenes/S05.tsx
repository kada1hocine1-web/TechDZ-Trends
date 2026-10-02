import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {C, seeded, Stage, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Stamp} from '../components/Stamp';
import {cue} from '../data/script';

const r = seeded(505);
const TIPS = Array.from({length: 40}).map((_, i) => ({x: 120 + r() * 840, y: 330 + r() * 480, rot: (r() - 0.5) * 30, d: i * 1.5}));

export const S05: React.FC = () => {
  const f = useStep();
  const tipsAt = cue('s05', 'milliers', 0.45);
  const coldAt = cue('s05', 'refroidit', 0.8);
  const frost = interpolate(f, [coldAt, coldAt + 20], [0, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.kraft}}>
      <Stage>
        <TornPaper x={540} y={130} w={760} h={120} seed={51} rotate={-1.5}>
          <div style={{fontFamily: TITLE, fontSize: 76, color: C.ink, textAlign: 'center', lineHeight: '125px', letterSpacing: 3}}>CELLULES D'ENQUÊTE</div>
        </TornPaper>
        {TIPS.map((t, i) =>
          f >= tipsAt - 20 + t.d ? (
            <TornPaper key={i} x={t.x} y={t.y} w={170} h={110} seed={520 + i} rotate={t.rot} rough={5}>
              <div style={{fontFamily: TYPE, fontSize: 18, color: C.ink, padding: '12px 14px'}}>SIGNALEMENT</div>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{height: 4, background: C.ink, opacity: 0.3, margin: '8px 14px', width: `${70 - k * 15}%`}} />
              ))}
            </TornPaper>
          ) : null,
        )}
        {f >= tipsAt && (
          <TornPaper x={540} y={560} w={940} h={110} seed={53} color={C.ink} rotate={2}>
            <div style={{fontFamily: TYPE, fontSize: 42, color: C.cream, textAlign: 'center', lineHeight: '110px'}}>DES MILLIERS DE SIGNALEMENTS</div>
          </TornPaper>
        )}
        <div style={{position: 'absolute', left: -420, top: -330, width: 1920, height: 1920, background: 'radial-gradient(circle, rgba(170,210,240,0.2), rgba(120,170,220,0.9))', opacity: frost}} />
        <Stamp x={540} y={760} start={coldAt + 8} size={110} rotate={-8} blend="normal">
          PISTE FROIDE
        </Stamp>
      </Stage>
    </AbsoluteFill>
  );
};
