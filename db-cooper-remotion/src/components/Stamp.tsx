import React from 'react';
import {interpolate, spring, useVideoConfig} from 'remotion';
import {C, TITLE, useStep} from './TornPaper';

const grunge = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.06' numOctaves='4' seed='3'/><feComponentTransfer><feFuncA type='discrete' tableValues='1 1 1 0.6 1 0 1 1'/></feComponentTransfer></filter><rect width='300' height='300' filter='url(#n)'/></svg>`,
)}")`;

// Ink stamp that slams onto the frame at `start`.
export const Stamp: React.FC<{
  x: number;
  y: number;
  start: number;
  children: React.ReactNode;
  rotate?: number;
  size?: number;
  color?: string;
  font?: string;
}> = ({x, y, start, children, rotate = -8, size = 90, color = C.red, font = TITLE}) => {
  const frame = useStep();
  const {fps} = useVideoConfig();
  if (frame < start) return null;
  const t = spring({frame: frame - start, fps, config: {damping: 14, stiffness: 260, mass: 0.7}});
  const scale = interpolate(t, [0, 1], [2.8, 1]);
  const opacity = interpolate(t, [0, 0.35], [0, 0.92], {extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
        opacity,
        color,
        fontFamily: font,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: size * 0.04,
        padding: `${size * 0.14}px ${size * 0.28}px ${size * 0.06}px`,
        border: `${Math.max(5, size * 0.07)}px solid ${color}`,
        outline: `${Math.max(2, size * 0.025)}px solid ${color}`,
        outlineOffset: size * 0.06,
        borderRadius: size * 0.08,
        whiteSpace: 'nowrap',
        mixBlendMode: 'multiply',
        WebkitMaskImage: grunge,
        maskImage: grunge,
        zIndex: 10,
      }}
    >
      {children}
    </div>
  );
};
