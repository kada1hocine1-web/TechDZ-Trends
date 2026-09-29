import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PAPER_FIBERS, seeded, useStep} from './TornPaper';

const grain = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='9' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='256' height='256' filter='url(#g)'/></svg>`,
)}")`;

// Full-frame paper texture + light animated grain + vignette.
export const PaperTexture: React.FC = () => {
  const frame = useStep();
  const r = seeded(Math.floor(frame / 2.5) + 17);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{backgroundImage: PAPER_FIBERS, backgroundSize: '520px 520px', mixBlendMode: 'multiply', opacity: 0.35}} />
      <AbsoluteFill
        style={{
          backgroundImage: grain,
          backgroundPosition: `${Math.floor(r() * 256)}px ${Math.floor(r() * 256)}px`,
          mixBlendMode: 'overlay',
          opacity: 0.22,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
    </AbsoluteFill>
  );
};
