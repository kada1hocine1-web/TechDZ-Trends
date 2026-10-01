import React from 'react';
import {Easing, interpolate} from 'remotion';
import {Stamp} from './Stamp';
import {TYPE, useStep} from './TornPaper';

export const formatFr = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Stamp-style counter: the stamp slams at `start`, the number rolls up to `value` over `dur` frames.
export const Counter: React.FC<{
  x: number;
  y: number;
  value: number;
  start: number;
  dur?: number;
  prefix?: string;
  suffix?: string;
  size?: number;
  rotate?: number;
  color?: string;
  blend?: React.CSSProperties['mixBlendMode'];
}> = ({x, y, value, start, dur = 24, prefix = '', suffix = '', size = 80, rotate = -6, color, blend}) => {
  const frame = useStep();
  const p = interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <Stamp x={x} y={y} start={start} size={size} rotate={rotate} font={TYPE} color={color} blend={blend}>
      {prefix}
      {formatFr(Math.round(value * p))}
      {suffix}
    </Stamp>
  );
};
