import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Emu, Ground, LewisGun, Soldier} from '../components/Characters';
import {C, Caption, Punch, Sfx, Sky, Stage} from '../components/Meme';
import {cue} from '../data/script';

const DIRS = [
  [-1.4, -0.5], [1.2, -0.7], [1.5, 0.3], [-0.2, -1], [0.6, 0.6],
];

export const S06: React.FC = () => {
  const f = useCurrentFrame();
  const splitAt = cue('s06', 'dispersent', 0.5);
  const guerillaAt = cue('s06', 'guérilla', 0.4);
  const luckAt = cue('s06', 'Bonne', 0.85);
  const t = Math.max(0, f - splitAt);
  return (
    <AbsoluteFill>
      <Sky />
      <Stage>
        <Ground y={700} color="#D08A4A" />
        {DIRS.map(([dx, dy], g) =>
          [0, 1, 2].map((k) => {
            const bx = 620 + (k - 1) * 70 + (g % 3) * 30 - 30;
            const by = 780 + (k % 2) * 40 + Math.floor(g / 3) * 30;
            const x = bx + dx * Math.min(t, 40) * 8;
            const y = by + dy * Math.min(t, 40) * 4;
            return (
              <div key={`${g}-${k}`} style={{position: 'absolute', left: x, top: y - 220, zIndex: Math.round(y)}}>
                <Emu size={220} phase={f / (t > 0 ? 1.6 : 4) + g + k} flip={dx < 0} look={f % 20 < 10 ? 0.8 : -0.8} />
              </div>
            );
          }),
        )}
        <div style={{position: 'absolute', left: 40, top: 860, zIndex: 2000}}>
          <LewisGun width={380} firing={f < luckAt} frame={f} />
        </div>
        <div style={{position: 'absolute', left: 0, top: 620, zIndex: 1999}}>
          <Soldier size={300} scared={f >= splitAt} />
        </div>
        <Punch at={guerillaAt} x={560} y={420} size={78} bg={C.ink} color={C.yellow} rotate={-4}>
          Mode guérilla : activé
        </Punch>
      </Stage>
      <Caption text="Les émeus face aux balles" />
      <Caption text="Bonne chance." position="bottom" at={luckAt} />
      <Sfx at={4} name="gun" volume={0.45} />
      <Sfx at={guerillaAt} name="boom" />
      <Sfx at={splitAt} name="whoosh" />
    </AbsoluteFill>
  );
};
