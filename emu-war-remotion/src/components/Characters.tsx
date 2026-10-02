import React from 'react';
import {C, FONT, seeded} from './Meme';

// Cartoon emu, feet at the bottom centre of its box. `phase` drives the run cycle (radians),
// `look` moves the googly pupil (-1..1). `tank` swaps the legs for tank tracks and adds a turret.
export const Emu: React.FC<{
  size: number; phase?: number; look?: number; flip?: boolean; tank?: boolean; crown?: boolean; hit?: boolean;
}> = ({size, phase = 0, look = 0.6, flip = false, tank = false, crown = false, hit = false}) => {
  const legA = Math.sin(phase) * 30;
  const legB = -Math.sin(phase) * 30;
  const bob = Math.abs(Math.sin(phase)) * 6;
  const leg = (a: number, key: string) => (
    <g key={key} transform={`rotate(${a} 110 205)`}>
      <path d="M110 205 L112 262" stroke="#8a8a8a" strokeWidth={11} strokeLinecap="round" />
      <path d="M112 262 L108 312" stroke="#8a8a8a" strokeWidth={8} strokeLinecap="round" />
      <path d="M108 312 l18 4 M108 312 l-4 8 M108 312 l12 -6" stroke="#6f6f6f" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
  return (
    <svg width={(size * 220) / 320} height={size} viewBox="0 0 220 320" style={{overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined}}>
      {tank ? (
        <g>
          <rect x={20} y={225} width={180} height={70} rx={34} fill="#3d4a2c" stroke={C.ink} strokeWidth={5} />
          {[50, 90, 130, 170].map((x) => (
            <circle key={x} cx={x} cy={260} r={20} fill="#6a7550" stroke={C.ink} strokeWidth={4} />
          ))}
        </g>
      ) : (
        [leg(legA, 'a'), leg(legB, 'b')]
      )}
      <g transform={`translate(0 ${-bob})`}>
        {/* shaggy body */}
        <ellipse cx={100} cy={170} rx={84} ry={60} fill="#5b4a3c" stroke={C.ink} strokeWidth={5} />
        {Array.from({length: 14}).map((_, i) => (
          <path key={i} d={`M${40 + (i % 7) * 20} ${140 + Math.floor(i / 7) * 34} q 10 18 -4 30`} stroke="#8a735e" strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        <path d="M18 160 q -20 20 0 40 q -14 -2 -10 20" stroke="#5b4a3c" strokeWidth={14} fill="none" strokeLinecap="round" />
        {tank && (
          <g>
            <rect x={60} y={110} width={80} height={36} rx={10} fill="#4d5a38" stroke={C.ink} strokeWidth={4} />
            <rect x={136} y={120} width={70} height={14} fill="#4d5a38" stroke={C.ink} strokeWidth={4} />
          </g>
        )}
        {/* neck + head */}
        <path d="M150 140 C 175 110, 160 70, 172 40" stroke="#6f7f95" strokeWidth={24} fill="none" strokeLinecap="round" />
        <path d="M150 140 C 175 110, 160 70, 172 40" stroke={C.ink} strokeWidth={30} fill="none" strokeLinecap="round" opacity={0.15} />
        <circle cx={174} cy={38} r={25} fill="#4d6fa0" stroke={C.ink} strokeWidth={5} />
        <path d="M194 36 L222 44 L194 52 Z" fill="#2d2d2d" stroke={C.ink} strokeWidth={3} />
        {hit ? (
          <path d="M168 24 l14 14 M182 24 l-14 14" stroke={C.ink} strokeWidth={5} />
        ) : (
          <>
            <circle cx={178} cy={30} r={14} fill={C.white} stroke={C.ink} strokeWidth={4} />
            <circle cx={178 + look * 5} cy={31} r={6.5} fill={C.ink} />
          </>
        )}
        {crown && <path d="M152 8 l6 -26 l12 16 l8 -22 l8 22 l12 -16 l4 26 Z" fill={C.yellow} stroke={C.ink} strokeWidth={4} />}
      </g>
    </svg>
  );
};

// Australian soldier with a slouch hat (brim pinned up on one side). `officer` adds a moustache and cap badge.
export const Soldier: React.FC<{size: number; scared?: boolean; officer?: boolean; flip?: boolean}> = ({size, scared = false, officer = false, flip = false}) => (
  <svg width={(size * 160) / 300} height={size} viewBox="0 0 160 300" style={{overflow: 'visible', transform: flip ? 'scaleX(-1)' : undefined}}>
    <rect x={52} y={210} width={22} height={86} rx={8} fill="#5c5c30" stroke={C.ink} strokeWidth={4} />
    <rect x={86} y={210} width={22} height={86} rx={8} fill="#5c5c30" stroke={C.ink} strokeWidth={4} />
    <path d="M40 120 Q80 100 120 120 L124 220 L36 220 Z" fill={C.khaki} stroke={C.ink} strokeWidth={5} />
    <rect x={40} y={180} width={80} height={10} fill="#4a3a22" />
    <circle cx={80} cy={80} r={34} fill="#f0c49a" stroke={C.ink} strokeWidth={5} />
    <circle cx={68} cy={78} r={scared ? 8 : 4} fill={scared ? C.white : C.ink} stroke={C.ink} strokeWidth={scared ? 3 : 0} />
    <circle cx={92} cy={78} r={scared ? 8 : 4} fill={scared ? C.white : C.ink} stroke={C.ink} strokeWidth={scared ? 3 : 0} />
    {scared && (
      <>
        <circle cx={68} cy={79} r={3} fill={C.ink} />
        <circle cx={92} cy={79} r={3} fill={C.ink} />
        <ellipse cx={80} cy={100} rx={7} ry={9} fill={C.ink} />
        <path d="M112 60 q 8 12 0 18 q -8 -6 0 -18" fill="#8fd3ff" stroke={C.ink} strokeWidth={2} />
      </>
    )}
    {!scared && <path d="M70 100 q 10 6 20 0" stroke={C.ink} strokeWidth={4} fill="none" />}
    {officer && <path d="M64 94 q 16 -8 32 0 q -16 6 -32 0" fill="#6b4a2a" stroke={C.ink} strokeWidth={2} />}
    {/* slouch hat */}
    <path d="M22 58 Q80 40 138 58 L130 66 Q80 54 30 66 Z" fill="#8a7a4a" stroke={C.ink} strokeWidth={4} />
    <path d="M48 58 Q52 22 80 20 Q108 22 112 58 Z" fill="#8a7a4a" stroke={C.ink} strokeWidth={4} />
    <path d="M22 58 L14 22 L40 50 Z" fill="#8a7a4a" stroke={C.ink} strokeWidth={4} />
    <rect x={48} y={48} width={64} height={8} fill="#4a3a22" />
    {officer && <circle cx={30} cy={42} r={7} fill={C.yellow} stroke={C.ink} strokeWidth={2} />}
  </svg>
);

// Wheat farmer (veteran), wide-brim hat.
export const Farmer: React.FC<{size: number; mood?: 'happy' | 'angry' | 'phone'}> = ({size, mood = 'happy'}) => (
  <svg width={(size * 160) / 300} height={size} viewBox="0 0 160 300" style={{overflow: 'visible'}}>
    <rect x={52} y={210} width={22} height={86} rx={8} fill="#3d5a80" stroke={C.ink} strokeWidth={4} />
    <rect x={86} y={210} width={22} height={86} rx={8} fill="#3d5a80" stroke={C.ink} strokeWidth={4} />
    <path d="M40 120 Q80 100 120 120 L124 220 L36 220 Z" fill="#c0392b" stroke={C.ink} strokeWidth={5} />
    <path d="M58 130 L58 220 M102 130 L102 220" stroke="#3d5a80" strokeWidth={10} />
    <circle cx={80} cy={80} r={34} fill="#f0c49a" stroke={C.ink} strokeWidth={5} />
    {mood === 'angry' ? (
      <>
        <path d="M60 68 l16 8 M100 68 l-16 8" stroke={C.ink} strokeWidth={5} />
        <circle cx={68} cy={82} r={4} fill={C.ink} />
        <circle cx={92} cy={82} r={4} fill={C.ink} />
        <path d="M68 104 q 12 -8 24 0" stroke={C.ink} strokeWidth={4} fill="none" />
      </>
    ) : (
      <>
        <circle cx={68} cy={78} r={4} fill={C.ink} />
        <circle cx={92} cy={78} r={4} fill={C.ink} />
        <path d="M66 98 q 14 12 28 0" stroke={C.ink} strokeWidth={4} fill="none" />
      </>
    )}
    {mood === 'phone' && (
      <g>
        <rect x={108} y={60} width={16} height={46} rx={6} fill={C.ink} />
        <path d="M120 110 L126 150" stroke="#c0392b" strokeWidth={12} strokeLinecap="round" />
      </g>
    )}
    <ellipse cx={80} cy={52} rx={64} ry={12} fill="#d9b36a" stroke={C.ink} strokeWidth={4} />
    <path d="M50 52 Q54 18 80 16 Q106 18 110 52 Z" fill="#d9b36a" stroke={C.ink} strokeWidth={4} />
  </svg>
);

// Lewis gun: finned barrel shroud, pan magazine on top, bipod. `firing` shows a muzzle flash, `jammed` smoke.
export const LewisGun: React.FC<{width: number; firing?: boolean; jammed?: boolean; frame?: number}> = ({width, firing = false, jammed = false, frame = 0}) => (
  <svg width={width} height={(width * 150) / 380} viewBox="0 0 380 150" style={{overflow: 'visible'}}>
    <path d="M20 70 L90 60 L96 92 L30 104 Z" fill="#6b4a2a" stroke={C.ink} strokeWidth={5} />
    <rect x={90} y={52} width={210} height={36} rx={14} fill="#3a3a3a" stroke={C.ink} strokeWidth={5} />
    {Array.from({length: 9}).map((_, i) => (
      <line key={i} x1={130 + i * 18} y1={54} x2={130 + i * 18} y2={86} stroke="#555" strokeWidth={4} />
    ))}
    <rect x={298} y={64} width={46} height={12} fill="#2a2a2a" stroke={C.ink} strokeWidth={3} />
    <ellipse cx={150} cy={44} rx={62} ry={14} fill="#2f2f2f" stroke={C.ink} strokeWidth={5} />
    <path d="M250 88 L220 146 M250 88 L284 146" stroke="#2a2a2a" strokeWidth={8} strokeLinecap="round" />
    {firing && frame % 4 < 2 && (
      <path d="M346 70 l40 -26 l-14 24 l34 2 l-34 10 l18 24 l-44 -20 Z" fill={C.yellow} stroke={C.red} strokeWidth={4} />
    )}
    {jammed &&
      [0, 1, 2].map((i) => {
        const t = ((frame / 20 + i / 3) % 1);
        return <circle key={i} cx={330 + t * 30} cy={50 - t * 90} r={14 + t * 26} fill="#9a9a9a" opacity={0.8 * (1 - t)} />;
      })}
  </svg>
);

// A band of wheat. `eaten` (0..1) shortens and thins it.
export const Wheat: React.FC<{y: number; eaten?: number; seed?: number}> = ({y, eaten = 0, seed = 3}) => {
  const r = seeded(seed);
  const stalks = Array.from({length: 70}).map(() => ({x: -420 + r() * 1920, h: 110 + r() * 70, gone: r()}));
  return (
    <svg width={1920} height={400} style={{position: 'absolute', left: -420, top: y - 200, overflow: 'visible'}}>
      {stalks.map((s, i) =>
        s.gone < eaten ? (
          <path key={i} d={`M${s.x + 420} 300 l0 -20`} stroke="#8a6a2a" strokeWidth={6} strokeLinecap="round" />
        ) : (
          <g key={i}>
            <path d={`M${s.x + 420} 300 L${s.x + 420} ${300 - s.h}`} stroke="#b88a2a" strokeWidth={6} />
            <ellipse cx={s.x + 420} cy={300 - s.h} rx={10} ry={26} fill={C.wheat} stroke="#8a6a2a" strokeWidth={3} />
          </g>
        ),
      )}
    </svg>
  );
};

// Red-dirt ground band that spans the full frame in both formats.
const TUFTS = (() => {
  const r = seeded(77);
  return Array.from({length: 40}).map(() => ({x: r() * 1920, y: 20 + r() * 900, s: 0.6 + r() * 0.8}));
})();

export const Ground: React.FC<{y: number; color?: string}> = ({y, color = C.outback}) => (
  <div style={{position: 'absolute', left: -420, width: 1920, top: y, height: 1400, background: color, borderTop: `6px solid ${C.ink}`, overflow: 'hidden'}}>
    <svg width={1920} height={1400} style={{position: 'absolute', inset: 0}}>
      {TUFTS.map((t, i) =>
        i % 3 === 0 ? (
          <ellipse key={i} cx={t.x} cy={t.y} rx={14 * t.s} ry={8 * t.s} fill="rgba(0,0,0,0.18)" />
        ) : (
          <path key={i} d={`M${t.x} ${t.y} l-10 -${24 * t.s} M${t.x} ${t.y} l0 -${30 * t.s} M${t.x} ${t.y} l10 -${24 * t.s}`} stroke="#7a8a3a" strokeWidth={5} strokeLinecap="round" />
        ),
      )}
    </svg>
  </div>
);

export const Newspaper: React.FC<{title: string; w?: number}> = ({title, w = 420}) => (
  <div style={{width: w, height: w * 0.7, background: '#f4f1e8', border: `5px solid ${C.ink}`, padding: 18, boxSizing: 'border-box', boxShadow: `10px 10px 0 ${C.ink}`}}>
    <div style={{fontFamily: FONT, fontSize: w * 0.06, borderBottom: `4px solid ${C.ink}`, textAlign: 'center'}}>LA GAZETTE</div>
    <div style={{fontFamily: FONT, fontSize: w * 0.11, lineHeight: 1.05, marginTop: 12, textAlign: 'center', color: C.ink}}>{title}</div>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{height: 8, background: '#bbb', marginTop: 14, width: `${90 - i * 15}%`}} />
    ))}
  </div>
);

export const Truck: React.FC<{width: number}> = ({width}) => (
  <svg width={width} height={width * 0.55} viewBox="0 0 300 165" style={{overflow: 'visible'}}>
    <rect x={10} y={40} width={180} height={90} fill={C.khaki} stroke={C.ink} strokeWidth={5} />
    <path d="M190 70 L250 70 L280 100 L280 130 L190 130 Z" fill="#5c5c30" stroke={C.ink} strokeWidth={5} />
    <rect x={205} y={80} width={36} height={24} fill="#bfe6f2" stroke={C.ink} strokeWidth={4} />
    <circle cx={60} cy={138} r={24} fill="#333" stroke={C.ink} strokeWidth={5} />
    <circle cx={240} cy={138} r={24} fill="#333" stroke={C.ink} strokeWidth={5} />
  </svg>
);
