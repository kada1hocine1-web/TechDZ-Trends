import React from 'react';
import {tornPath} from './TornPaper';

// Semi-transparent piece of tape with jagged ends. x/y = center.
export const Tape: React.FC<{x: number; y: number; rotate?: number; w?: number; seed?: number}> = ({
  x, y, rotate = -30, w = 150, seed = 1,
}) => {
  const h = 44;
  const d = React.useMemo(() => tornPath(w, h, seed, 5), [w, seed]);
  return (
    <svg
      width={w}
      height={h}
      style={{position: 'absolute', left: x - w / 2, top: y - h / 2, transform: `rotate(${rotate}deg)`, overflow: 'visible', zIndex: 5}}
    >
      <path d={d} fill="rgba(236,224,178,0.6)" stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
      <rect x={4} y={6} width={w - 8} height={4} fill="rgba(255,255,255,0.25)" />
    </svg>
  );
};
