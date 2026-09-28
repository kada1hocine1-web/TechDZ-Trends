import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../components/TornPaper';

// Man in a dark suit, black clip-on tie, dark glasses. "bust" for portraits, "figure" for the full silhouette.
export const Man: React.FC<{variant?: 'bust' | 'figure'; width: number; pose?: number}> = ({variant = 'bust', width, pose = 0}) => {
  if (variant === 'figure') {
    // pose 0 = standing, 1 = spread-eagle jump
    const a = pose * 60;
    return (
      <svg width={width} height={width * 2} viewBox="0 0 100 200" style={{overflow: 'visible'}}>
        <g fill={C.ink}>
          <circle cx={50} cy={22} r={13} />
          <path d="M34 40 Q50 34 66 40 L70 110 L30 110 Z" />
          <g transform={`rotate(${-a - 8} 36 44)`}><rect x={28} y={42} width={12} height={62} rx={6} /></g>
          <g transform={`rotate(${a + 8} 64 44)`}><rect x={60} y={42} width={12} height={62} rx={6} /></g>
          <g transform={`rotate(${-a * 0.4} 42 108)`}><rect x={35} y={104} width={14} height={80} rx={6} /></g>
          <g transform={`rotate(${a * 0.4} 58 108)`}><rect x={51} y={104} width={14} height={80} rx={6} /></g>
        </g>
        <rect x={38} y={18} width={24} height={6} rx={3} fill="#000" />
      </svg>
    );
  }
  return (
    <svg width={width} height={width * 1.3} viewBox="0 0 400 520">
      {/* suit */}
      <path d="M20 520 Q30 360 120 330 L200 360 L280 330 Q370 360 380 520 Z" fill={C.ink} />
      {/* shirt */}
      <path d="M150 335 L200 470 L250 335 L230 320 L200 345 L170 320 Z" fill={C.cream} />
      {/* lapels */}
      <path d="M120 330 L200 480 L160 340 Z M280 330 L200 480 L240 340 Z" fill="#2a2a2a" />
      {/* clip-on tie */}
      <path d="M188 348 L212 348 L206 366 L218 470 L200 492 L182 470 L194 366 Z" fill="#050505" />
      <rect x={183} y={400} width={34} height={6} rx={2} fill={C.kraft} />
      {/* neck + head */}
      <path d="M170 300 L230 300 L232 340 L200 350 L168 340 Z" fill="#b89a74" />
      <ellipse cx={200} cy={210} rx={82} ry={104} fill={C.kraft} />
      <path d="M118 190 Q120 100 200 96 Q284 100 284 196 Q270 140 200 138 Q140 140 118 190 Z" fill={C.ink} />
      <ellipse cx={118} cy={220} rx={10} ry={22} fill="#b89a74" />
      <ellipse cx={282} cy={220} rx={10} ry={22} fill="#b89a74" />
      {/* dark glasses */}
      <path d="M130 196 L192 196 L186 236 Q160 246 138 232 Z M208 196 L270 196 L262 232 Q240 246 214 236 Z" fill="#050505" />
      <rect x={186} y={198} width={28} height={6} fill="#050505" />
      <path d="M170 280 Q200 290 230 280" stroke="#6b5438" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M200 236 L194 262 L206 262" stroke="#8d7250" strokeWidth={4} fill="none" />
    </svg>
  );
};

export const S02: React.FC = () => <AbsoluteFill style={{background: C.cream}} />;
