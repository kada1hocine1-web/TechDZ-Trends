import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {C, seeded, TornPaper, useStep} from '../components/TornPaper';
import {Man} from './S02';
import {cue} from '../data/script';

// Boeing 727 in profile (nose to the right), T-tail, three rear engines, ventral aft airstair.
// `stairs` 0 = retracted, 1 = fully lowered. Viewbox 600 x 200, stair hinge at (112, 118).
export const STAIR_HINGE = [112, 118];
export const STAIR_LEN = 72;
export const STAIR_MAX = 42;
export const Plane: React.FC<{width: number; stairs?: number; gear?: boolean; blink?: boolean; color?: string}> = ({
  width, stairs = 0, gear = false, blink = false, color = '#cfd3d6',
}) => (
  <svg width={width} height={(width / 600) * 200} viewBox="0 0 600 200" style={{overflow: 'visible'}}>
    {/* aft airstair, hinged under the tail */}
    <g transform={`rotate(${-stairs * STAIR_MAX} ${STAIR_HINGE[0]} ${STAIR_HINGE[1]})`}>
      <rect x={STAIR_HINGE[0] - STAIR_LEN} y={STAIR_HINGE[1] - 5} width={STAIR_LEN} height={10} fill="#8d9296" />
      {Array.from({length: 7}).map((_, i) => (
        <rect key={i} x={STAIR_HINGE[0] - STAIR_LEN + 4 + i * 10} y={STAIR_HINGE[1] - 9} width={3} height={6} fill="#6b7074" />
      ))}
    </g>
    {gear && (
      <g fill={C.ink}>
        <rect x={318} y={120} width={6} height={30} /> <circle cx={321} cy={154} r={9} />
        <rect x={520} y={118} width={5} height={26} /> <circle cx={522} cy={148} r={7} />
      </g>
    )}
    {/* fin + T stabiliser */}
    <path d="M58 86 L28 14 L66 14 L140 86 Z" fill={C.red} />
    <path d="M14 16 L100 8 L104 16 L20 22 Z" fill={color} />
    {/* fuselage */}
    <path d="M40 90 L520 82 Q586 84 598 106 Q586 124 520 125 L160 125 Q92 124 40 104 Z" fill={color} />
    <path d="M40 104 Q92 124 160 125 L520 125 Q586 124 598 106 L596 110 Q582 130 520 131 L160 131 Q90 130 40 106 Z" fill="#9aa0a4" />
    <line x1={150} y1={112} x2={560} y2={110} stroke={C.red} strokeWidth={4} />
    {/* centre engine intake + side engine */}
    <path d="M128 84 Q142 66 170 72 L176 84 Z" fill="#9aa0a4" />
    <rect x={70} y={74} width={90} height={24} rx={12} fill="#b5babd" />
    <rect x={152} y={76} width={10} height={20} rx={4} fill="#2b2f33" />
    <path d="M140 98 L150 106 L128 106 Z" fill="#9aa0a4" />
    {/* windows */}
    {Array.from({length: 26}).map((_, i) => (
      <rect key={i} x={186 + i * 12.5} y={94} width={6} height={8} rx={2} fill={blink ? '#f4d98a' : '#2b2f33'} />
    ))}
    <path d="M556 92 L576 94 L582 102 L558 101 Z" fill="#2b2f33" />
    {/* wing */}
    <path d="M372 112 L300 112 L226 164 L256 166 Z" fill="#b5babd" />
    {blink && <circle cx={240} cy={165} r={5} fill="#ff3b30" />}
  </svg>
);

export const Parachute: React.FC<{width: number; open: number; color?: string}> = ({width, open, color = C.cream}) => (
  <svg width={width} height={width} viewBox="0 0 200 200" style={{overflow: 'visible'}}>
    <g transform={`translate(100 70) scale(${0.15 + open * 0.85} ${0.35 + open * 0.65}) translate(-100 -70)`}>
      <path d="M10 80 Q100 -30 190 80 Q170 70 147 80 Q124 70 100 80 Q76 70 53 80 Q30 70 10 80 Z" fill={color} />
      {[53, 100, 147].map((x) => (
        <path key={x} d={`M${x} 80 Q${100 + (x - 100) * 0.5} 10 100 16`} stroke={C.kraft} strokeWidth={3} fill="none" />
      ))}
      {[10, 53, 100, 147, 190].map((x) => (
        <line key={x} x1={x} y1={80} x2={100} y2={170} stroke={C.fiber} strokeWidth={1.5} opacity={0.8} />
      ))}
    </g>
  </svg>
);

const ridge = (seed: number, base: number, amp: number, peaks: number) => {
  const r = seeded(seed);
  let d = `M-40,1960 L-40,${base}`;
  for (let x = -40; x <= 1120; x += 24) {
    const u = ((x / 1080) * peaks + seed * 0.37) % 1;
    const p = 1 - Math.abs(u * 2 - 1);
    d += ` L${x},${(base - p * amp + (r() - 0.5) * 36).toFixed(0)}`;
  }
  return d + ' L1120,1960 Z';
};

const Firs: React.FC<{y: number; seed: number; color: string; scale: number}> = ({y, seed, color, scale}) => {
  const r = seeded(seed);
  const trees = Array.from({length: Math.round(1300 / (60 * scale))}).map((_, i) => ({
    x: -60 + i * 60 * scale + r() * 30,
    h: (140 + r() * 120) * scale,
  }));
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 -3px 0 rgba(251,247,236,0.18))'}}>
      <g fill={color}>
        {trees.map((t, i) => (
          <path
            key={i}
            d={`M${t.x},${y - t.h} L${t.x + t.h * 0.22},${y - t.h * 0.6} L${t.x + t.h * 0.12},${y - t.h * 0.6} L${t.x + t.h * 0.32},${y - t.h * 0.25} L${t.x + t.h * 0.18},${y - t.h * 0.25} L${t.x + t.h * 0.4},${y + 10} L${t.x - t.h * 0.4},${y + 10} L${t.x - t.h * 0.18},${y - t.h * 0.25} L${t.x - t.h * 0.32},${y - t.h * 0.25} L${t.x - t.h * 0.12},${y - t.h * 0.6} L${t.x - t.h * 0.22},${y - t.h * 0.6} Z`}
          />
        ))}
        <rect x={0} y={y} width={1080} height={1920 - y} />
      </g>
    </svg>
  );
};

export const S08: React.FC = () => {
  const f = useStep();
  const {fps, durationInFrames} = useVideoConfig();
  const stairsAt = cue('s08', 'abaisse', 0.55);
  const jumpAt = cue('s08', 'saute', 0.85) - 6;
  const stairs = spring({frame: f - stairsAt, fps, config: {damping: 18, stiffness: 50}});

  const s = 1.25;
  const px = interpolate(f, [0, durationInFrames], [150, 760]);
  const py = 560 + Math.sin(f / 20) * 6;
  const a = (-stairs * STAIR_MAX * Math.PI) / 180;
  const tipX = STAIR_HINGE[0] - STAIR_LEN * Math.cos(a);
  const tipY = STAIR_HINGE[1] - STAIR_LEN * Math.sin(a);
  const jx0 = interpolate(jumpAt, [0, durationInFrames], [150, 760]) + (tipX - 300) * s;
  const jy0 = 560 + (tipY - 100) * s;

  const t = f - jumpAt;
  const openAt = 9;
  const open = spring({frame: t - openAt, fps, config: {damping: 11, stiffness: 160}});
  const fall = t < openAt ? t * t : openAt * openAt + (t - openAt) * 12.5;
  const jx = jx0 - Math.max(0, t) * 2.2;
  const jy = jy0 + Math.max(0, fall);

  const r = seeded(8);
  const stars = Array.from({length: 60}).map(() => ({x: r() * 1080, y: 120 + r() * 800, s: 2 + r() * 4, p: r()}));

  return (
    <AbsoluteFill style={{background: `linear-gradient(${C.night}, #16273d 55%, ${C.night})`}}>
      {stars.map((st, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: st.x, top: st.y, width: st.s, height: st.s, borderRadius: '50%', background: C.fiber,
            opacity: 0.35 + 0.5 * Math.abs(Math.sin(f / 10 + st.p * 6)),
          }}
        />
      ))}
      <TornPaper x={260} y={400} w={420} h={60} seed={81} color="#223650" rotate={-3} shadow={false} style={{transform: `translateX(${-f * 0.6}px)`}} />
      <TornPaper x={860} y={760} w={380} h={50} seed={82} color="#1d304a" rotate={2} shadow={false} style={{transform: `translateX(${-f * 0.4}px)`}} />

      {/* plane */}
      <div style={{position: 'absolute', left: px - 300 * s, top: py - 100 * s, filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.6))'}}>
        <Plane width={600 * s} stairs={stairs} blink={Math.floor(f / 15) % 2 === 0} color="#aeb4b8" />
      </div>

      {/* jumper + parachute (behind the mountains' front layers) */}
      {t >= 0 && (
        <div style={{position: 'absolute', left: jx, top: jy, transform: 'translate(-50%, -100%)', opacity: interpolate(jy, [1300, 1480], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          {t >= openAt && (
            <div style={{position: 'absolute', left: -60, top: -110}}>
              <Parachute width={160} open={open} />
            </div>
          )}
          <div style={{transform: `rotate(${t < openAt ? t * 14 : 0}deg)`}}>
            <Man variant="figure" width={40} pose={t < openAt ? 1 : 0.3} />
          </div>
        </div>
      )}

      {/* mountains (snow caps = icy), forest */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 -4px 8px rgba(0,0,0,0.5))'}}>
        <defs>
          <clipPath id="peaks"><rect x={0} y={0} width={1080} height={1010} /></clipPath>
        </defs>
        <path d={ridge(3, 1200, 320, 2.3)} fill="#1c2d45" stroke={C.fiber} strokeWidth={3} />
        <path d={ridge(3, 1200, 320, 2.3)} fill={C.cream} clipPath="url(#peaks)" />
        <path d={ridge(3, 1200, 320, 2.3)} fill="#1c2d45" transform="translate(0 46)" clipPath="url(#peaks)" />
        <path d={ridge(9, 1360, 240, 3.3)} fill="#13223a" stroke={C.fiber} strokeWidth={3} strokeOpacity={0.5} />
      </svg>
      <Firs y={1460} seed={5} color="#0b1626" scale={0.8} />
      <Firs y={1620} seed={6} color="#060d18" scale={1.3} />
    </AbsoluteFill>
  );
};
