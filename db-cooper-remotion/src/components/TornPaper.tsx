import React from 'react';
import {useCurrentFrame} from 'remotion';
import {loadFont as loadSpecialElite} from '@remotion/google-fonts/SpecialElite';
import {loadFont as loadBebas} from '@remotion/google-fonts/BebasNeue';

export const TYPE = loadSpecialElite().fontFamily;
export const TITLE = loadBebas().fontFamily;

export const C = {
  cream: '#EDE3CC',
  kraft: '#C8A97E',
  ink: '#151515',
  red: '#B3261E',
  night: '#0E1A2B',
  fiber: '#FBF7EC',
};

// Deterministic PRNG (mulberry32).
export const seeded = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Stop-motion: values only change every 2.5 frames (12 img/s at 30 fps).
export const step = (frame: number) => Math.floor(frame / 2.5) * 2.5;
export const useStep = () => step(useCurrentFrame());

// Irregular torn outline for a w x h box. Points are pushed inward by `inset`..`inset + rough`.
export const tornPath = (w: number, h: number, seed: number, rough = 10, inset = 0) => {
  const r = seeded(seed);
  const pts: [number, number][] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(2, Math.round(len / (7 + r() * 6)));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const bite = r() < 0.06 ? rough * 0.8 : 0;
      const d = inset + r() * rough + bite;
      pts.push([x0 + (x1 - x0) * t + nx * d, y0 + (y1 - y0) * t + ny * d]);
    }
  };
  edge(0, 0, w, 0, 0, 1);
  edge(w, 0, w, h, -1, 0);
  edge(w, h, 0, h, 0, -1);
  edge(0, h, 0, 0, 1, 0);
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z';
};

const svgUrl = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

export const PAPER_FIBERS = svgUrl(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.9 0.04' numOctaves='3' seed='4'/><feColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.28 0 0 0 0 0.18 0 0 0 0.55 0'/></filter><rect width='400' height='400' filter='url(#f)'/></svg>`,
);

type Props = {
  x: number; // center
  y: number;
  w: number;
  h: number;
  seed: number;
  color?: string;
  rotate?: number;
  rough?: number;
  shadow?: boolean;
  jitter?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

// A paper cut-out: torn edge, white fibres on the rim, soft drop shadow, stop-motion micro-jitter.
export const TornPaper: React.FC<Props> = ({
  x, y, w, h, seed, color = C.cream, rotate = 0, rough = 10, shadow = true, jitter = true, style, children,
}) => {
  const frame = useStep();
  const m = rough * 0.6;
  const W = w + m * 2;
  const H = h + m * 2;
  const outer = React.useMemo(() => tornPath(W, H, seed, rough * 0.7, 0), [W, H, seed, rough]);
  const inner = React.useMemo(() => tornPath(W, H, seed + 991, rough, m * 0.7), [W, H, seed, rough, m]);
  const fibers = React.useMemo(() => {
    const r = seeded(seed + 7);
    const out: string[] = [];
    const count = Math.round((W + H) / 18);
    for (let i = 0; i < count; i++) {
      const side = Math.floor(r() * 4);
      const t = r();
      const len = 2 + r() * 5;
      const [px, py, nx, ny] =
        side === 0 ? [t * W, 1, 0, -1] : side === 1 ? [W - 1, t * H, 1, 0] : side === 2 ? [t * W, H - 1, 0, 1] : [1, t * H, -1, 0];
      const a = (r() - 0.5) * 1.4;
      out.push(`M${px},${py}l${(nx + ny * a) * len},${(ny + nx * a) * len}`);
    }
    return out.join('');
  }, [W, H, seed]);

  const j = seeded(seed * 131 + Math.floor(frame / 2.5));
  const dx = jitter ? (j() - 0.5) * 2.4 : 0;
  const dy = jitter ? (j() - 0.5) * 2.4 : 0;
  const dr = jitter ? (j() - 0.5) * 0.5 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - W / 2,
        top: y - H / 2,
        width: W,
        height: H,
        transform: `translate(${dx}px, ${dy}px) rotate(${rotate + dr}deg)`,
        filter: shadow ? 'drop-shadow(0 10px 14px rgba(0,0,0,0.38)) drop-shadow(0 2px 3px rgba(0,0,0,0.3))' : undefined,
        ...style,
      }}
    >
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={outer} fill={C.fiber} />
        <path d={fibers} stroke={C.fiber} strokeWidth={1.2} strokeLinecap="round" opacity={0.9} />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `path('${inner}')`,
          background: color,
        }}
      >
        <div style={{position: 'absolute', inset: 0, backgroundImage: PAPER_FIBERS, mixBlendMode: 'multiply', opacity: 0.5}} />
        <div style={{position: 'absolute', left: m, top: m, width: w, height: h}}>{children}</div>
      </div>
    </div>
  );
};
