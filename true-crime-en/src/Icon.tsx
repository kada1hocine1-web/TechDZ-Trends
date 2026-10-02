import React from 'react';
import {C} from './components/TornPaper';

const K = C.ink;
const S = {stroke: K, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

// Simple flat icons drawn in a 200x200 box (ink / cream / red / kraft), used by the visual blocks.
const ICONS: Record<string, React.ReactNode> = {
  house: <><path d="M30 95 L100 35 L170 95 Z" fill={C.red} {...S} /><rect x={45} y={95} width={110} height={80} fill={C.cream} {...S} /><rect x={88} y={125} width={26} height={50} fill={K} /><rect x={58} y={110} width={22} height={22} fill="#e9d68a" {...S} strokeWidth={4} /><rect x={122} y={110} width={22} height={22} fill="#e9d68a" {...S} strokeWidth={4} /></>,
  tent: <><path d="M20 170 L100 40 L180 170 Z" fill={C.kraft} {...S} /><path d="M100 40 L100 170" {...S} /><path d="M100 90 L120 170 M100 90 L82 170" stroke={C.red} strokeWidth={5} /></>,
  footprints: <>{[[60, 150, -10], [100, 110, 8], [70, 70, -10], [112, 32, 8]].map(([x, y, r], i) => <g key={i} transform={`rotate(${r} ${x} ${y})`}><ellipse cx={x} cy={y} rx={14} ry={24} fill={K} /><circle cx={x} cy={y + 32} r={10} fill={K} /></g>)}</>,
  mountain: <><path d="M10 175 L75 60 L110 115 L140 75 L190 175 Z" fill="#3d4f66" {...S} /><path d="M75 60 L60 87 L75 80 L88 92 Z M140 75 L130 92 L142 88 L150 96 Z" fill={C.cream} /></>,
  beach: <><circle cx={150} cy={50} r={26} fill="#e9c46a" {...S} /><path d="M0 120 Q50 105 100 120 T200 120 L200 200 L0 200 Z" fill="#4f86a8" {...S} /><path d="M0 160 Q60 150 120 165 T200 160 L200 200 L0 200 Z" fill={C.kraft} {...S} /></>,
  book: <><path d="M20 50 Q60 35 100 55 Q140 35 180 50 L180 160 Q140 145 100 165 Q60 145 20 160 Z" fill={C.cream} {...S} /><path d="M100 55 L100 165" {...S} />{[75, 95, 115].map((y) => <path key={y} d={`M35 ${y} Q60 ${y - 8} 85 ${y + 2} M115 ${y + 2} Q140 ${y - 8} 165 ${y}`} stroke={K} strokeWidth={3} fill="none" opacity={0.5} />)}</>,
  bottle: <><rect x={70} y={20} width={60} height={30} rx={6} fill={C.red} {...S} /><rect x={55} y={50} width={90} height={130} rx={14} fill={C.cream} {...S} /><rect x={55} y={90} width={90} height={50} fill={C.red} /><ellipse cx={100} cy={115} rx={22} ry={10} fill={C.cream} /></>,
  car: <><path d="M20 130 L35 90 Q45 70 70 70 L130 70 Q155 70 165 90 L180 130 Z" fill="#2d3e55" {...S} /><rect x={15} y={125} width={170} height={30} rx={10} fill="#2d3e55" {...S} /><circle cx={55} cy={158} r={18} fill={K} /><circle cx={145} cy={158} r={18} fill={K} /><path d="M55 95 L80 80 L120 80 L145 95 Z" fill="#bfe6f2" /></>,
  suitcase: <><rect x={30} y={60} width={140} height={110} rx={12} fill="#6b4a2a" {...S} /><path d="M75 60 L75 40 L125 40 L125 60" fill="none" {...S} /><rect x={30} y={100} width={140} height={10} fill={K} /></>,
  axe: <><rect x={92} y={40} width={16} height={140} rx={6} fill="#8a6038" {...S} transform="rotate(25 100 110)" /><path d="M95 30 Q150 20 160 60 Q130 70 105 75 Z" fill="#b5babd" {...S} transform="rotate(25 100 110)" /></>,
  mirror: <><ellipse cx={100} cy={95} rx={55} ry={75} fill="#b5c7d3" {...S} /><path d="M45 40 L155 40 L160 175 L40 175 Z" fill={C.kraft} opacity={0.95} {...S} /><path d="M50 70 Q100 85 150 70 M50 110 Q100 125 150 110 M50 150 Q100 165 150 150" stroke="#8a6d4a" strokeWidth={4} fill="none" /></>,
  window: <><rect x={40} y={30} width={120} height={140} fill="#203048" {...S} /><path d="M100 30 L100 170 M40 100 L160 100" {...S} /><path d="M35 25 L165 25 L160 120 L40 120 Z" fill={C.kraft} opacity={0.9} {...S} strokeWidth={4} /></>,
  key: <><circle cx={60} cy={100} r={32} fill="none" {...S} strokeWidth={10} /><path d="M92 100 L175 100 M150 100 L150 125 M170 100 L170 120" {...S} strokeWidth={10} /></>,
  envelope: <><rect x={20} y={50} width={160} height={110} fill={C.cream} {...S} /><path d="M20 50 L100 115 L180 50" fill="none" {...S} /><circle cx={150} cy={135} r={12} fill={C.red} /></>,
  magnifier: <><circle cx={85} cy={85} r={50} fill="#bfe6f2" {...S} strokeWidth={10} /><path d="M122 122 L175 175" {...S} strokeWidth={18} /></>,
  badge: <><path d="M100 20 L170 50 L160 120 Q140 165 100 185 Q60 165 40 120 L30 50 Z" fill="#c9a24a" {...S} /><path d="M100 60 L111 90 L143 90 L117 108 L127 140 L100 120 L73 140 L83 108 L57 90 L89 90 Z" fill={C.cream} {...S} strokeWidth={4} /></>,
  flame: <><path d="M100 20 Q150 80 140 130 Q130 180 100 180 Q60 180 55 135 Q50 95 80 70 Q80 105 100 110 Q90 70 100 20 Z" fill="#e8742c" {...S} /><path d="M100 110 Q120 130 115 155 Q100 170 88 155 Q80 135 100 110 Z" fill="#f4d35e" /></>,
  river: <><path d="M0 90 Q50 70 100 90 T200 90 L200 200 L0 200 Z" fill="#4f86a8" {...S} /><path d="M20 130 Q50 120 80 130 M110 150 Q140 140 170 150" stroke={C.cream} strokeWidth={5} fill="none" /></>,
  clock: <><circle cx={100} cy={100} r={75} fill={C.cream} {...S} strokeWidth={8} /><path d="M100 100 L100 50 M100 100 L135 115" {...S} strokeWidth={8} /><circle cx={100} cy={100} r={8} fill={C.red} /></>,
  money: <><rect x={20} y={60} width={160} height={80} rx={6} fill="#a9b98e" {...S} /><ellipse cx={100} cy={100} rx={24} ry={30} fill="#d9dfc8" {...S} strokeWidth={4} /><text x={40} y={85} fontSize={22} fontWeight="bold" fill={K}>£1</text></>,
  tie: <><path d="M80 30 L120 30 L110 60 L130 160 L100 185 L70 160 L90 60 Z" fill={K} {...S} /><rect x={75} y={90} width={50} height={8} fill={C.kraft} /></>,
  ticket: <><path d="M20 60 L180 60 L180 85 Q165 100 180 115 L180 140 L20 140 L20 115 Q35 100 20 85 Z" fill={C.cream} {...S} /><rect x={20} y={60} width={160} height={20} fill={C.red} /><path d="M130 85 L130 140" stroke={K} strokeWidth={3} strokeDasharray="6 6" /></>,
  briefcase: <><rect x={25} y={65} width={150} height={100} rx={10} fill="#4a3624" {...S} /><path d="M75 65 L75 45 L125 45 L125 65" fill="none" {...S} />{[55, 80, 105, 130].map((x) => <rect key={x} x={x} y={85} width={16} height={60} rx={5} fill={C.red} />)}<path d="M55 90 Q100 70 145 95" stroke="#e9d68a" strokeWidth={3} fill="none" /></>,
  plane: <><path d="M15 105 L170 95 Q195 98 190 105 Q195 112 170 115 L15 112 Z" fill="#cfd3d6" {...S} /><path d="M95 105 L70 150 L90 150 L125 108 Z M95 100 L70 60 L90 60 L125 102 Z" fill="#b5babd" {...S} strokeWidth={4} /><path d="M25 105 L12 75 L30 75 L45 104 Z" fill={C.red} {...S} strokeWidth={4} /></>,
  parachute: <><path d="M25 90 Q100 -10 175 90 Q150 80 125 90 Q100 80 75 90 Q50 80 25 90 Z" fill={C.cream} {...S} />{[25, 75, 125, 175].map((x) => <path key={x} d={`M${x} 90 L100 160`} stroke={K} strokeWidth={3} />)}<circle cx={100} cy={165} r={10} fill={K} /><rect x={92} y={172} width={16} height={22} fill={K} /></>,
  mic: <><rect x={70} y={20} width={60} height={95} rx={30} fill="#3a3a3a" {...S} /><path d="M50 95 Q50 145 100 145 Q150 145 150 95" fill="none" {...S} /><path d="M100 145 L100 180 M70 180 L130 180" {...S} /></>,
  computer: <><rect x={25} y={35} width={150} height={100} rx={8} fill="#203048" {...S} /><rect x={40} y={50} width={120} height={70} fill="#4f86a8" /><path d="M80 135 L70 165 L130 165 L120 135" fill={C.cream} {...S} /></>,
  burger: <><path d="M30 95 Q30 40 100 40 Q170 40 170 95 Z" fill="#d99a3e" {...S} /><rect x={25} y={95} width={150} height={18} rx={6} fill="#4f7a3a" {...S} strokeWidth={4} /><rect x={30} y={113} width={140} height={22} rx={8} fill="#6b3e26" {...S} strokeWidth={4} /><path d="M30 135 L170 135 Q170 160 100 160 Q30 160 30 135 Z" fill="#d99a3e" {...S} /></>,
  bandage: <><rect x={30} y={75} width={140} height={50} rx={25} fill="#e9c9a8" {...S} transform="rotate(-30 100 100)" /><rect x={80} y={80} width={40} height={40} fill="#f4e4d0" transform="rotate(-30 100 100)" /></>,
  fingerprint: <>{[20, 35, 50, 65].map((r) => <ellipse key={r} cx={100} cy={105} rx={r * 0.8} ry={r} fill="none" stroke={K} strokeWidth={6} strokeDasharray={r === 50 ? '30 10' : undefined} />)}</>,
  dna: <>{Array.from({length: 9}).map((_, i) => { const y = 25 + i * 19; const a = 100 + Math.sin(i * 0.8) * 45; const b = 200 - a; return <g key={i}><path d={`M${a} ${y} L${b} ${y}`} stroke={C.kraft} strokeWidth={5} /><circle cx={a} cy={y} r={9} fill={C.red} /><circle cx={b} cy={y} r={9} fill={C.cream} stroke={K} strokeWidth={2} /></g>; })}</>,
  scissors: <><circle cx={55} cy={145} r={22} fill="none" {...S} strokeWidth={9} /><circle cx={145} cy={145} r={22} fill="none" {...S} strokeWidth={9} /><path d="M70 128 L140 30 M130 128 L60 30" {...S} strokeWidth={9} /></>,
  scroll: <><rect x={50} y={40} width={100} height={120} fill={C.cream} {...S} /><circle cx={50} cy={50} r={14} fill={C.kraft} {...S} strokeWidth={4} /><circle cx={150} cy={150} r={14} fill={C.kraft} {...S} strokeWidth={4} /><text x={62} y={110} fontSize={22} fontFamily="serif" fill={K}>Tamám</text></>,
  seal: <><rect x={45} y={30} width={110} height={150} rx={14} fill={C.cream} {...S} /><rect x={40} y={20} width={120} height={30} rx={6} fill={C.red} {...S} /><path d="M70 105 L92 128 L135 80" stroke="#2f7a3a" strokeWidth={12} fill="none" strokeLinecap="round" /></>,
  shelf: <><path d="M15 70 L185 70 M15 140 L185 140" {...S} strokeWidth={8} />{[30, 75, 120].map((x) => <rect key={x} x={x} y={25} width={35} height={45} rx={5} fill={C.red} {...S} strokeWidth={3} />)}{[45, 100, 150].map((x) => <rect key={x} x={x} y={95} width={35} height={45} rx={5} fill={C.cream} {...S} strokeWidth={3} />)}</>,
  snow: <>{[0, 60, 120].map((r) => <path key={r} d="M100 25 L100 175" {...S} strokeWidth={8} transform={`rotate(${r} 100 100)`} />)}<circle cx={100} cy={100} r={14} fill={C.cream} {...S} /></>,
  photo: <><rect x={30} y={45} width={140} height={115} fill={C.cream} {...S} /><rect x={45} y={58} width={110} height={80} fill="#8a8578" /><circle cx={100} cy={88} r={16} fill={K} opacity={0.7} /><path d="M70 138 Q100 100 130 138 Z" fill={K} opacity={0.7} /></>,
  wig: <><path d="M40 160 Q20 60 100 40 Q180 60 160 160 Q140 120 130 90 Q100 110 70 90 Q60 120 40 160 Z" fill="#6b3e26" {...S} /></>,
  glasses: <><circle cx={60} cy={105} r={32} fill="#e5eef2" {...S} /><circle cx={140} cy={105} r={32} fill="#e5eef2" {...S} /><path d="M92 100 Q100 90 108 100 M28 95 L10 80 M172 95 L190 80" fill="none" {...S} /></>,
  phone: <><path d="M40 60 Q40 35 70 35 L130 35 Q160 35 160 60 L140 80 L120 70 L80 70 L60 80 Z" fill={K} /><rect x={55} y={95} width={90} height={75} rx={10} fill="#3a3a3a" {...S} /><circle cx={100} cy={132} r={22} fill={C.cream} {...S} strokeWidth={4} /></>,
  tree: <><path d="M100 20 L150 90 L125 90 L165 145 L35 145 L75 90 L50 90 Z" fill="#2f4f3a" {...S} /><rect x={90} y={145} width={20} height={35} fill="#6b4a2a" {...S} strokeWidth={4} /></>,
};

export const Icon: React.FC<{name: string; size: number}> = ({name, size}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow: 'visible'}}>
    {ICONS[name] ?? ICONS.magnifier}
  </svg>
);
