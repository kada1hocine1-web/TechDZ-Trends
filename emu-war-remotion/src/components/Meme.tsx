import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Anton';
import type {Word} from '../data/script';

export const FONT = loadFont().fontFamily;

export const C = {
  sky: '#7EC8E3',
  skyDeep: '#3F9CC4',
  wheat: '#E8B84A',
  dirt: '#C1440E',
  outback: '#E07A3F',
  khaki: '#7A7A3F',
  ink: '#111111',
  white: '#FFFFFF',
  yellow: '#FFE14D',
  red: '#E0262B',
  water: '#4FA3C7',
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

// 9:16: stage sits a little above centre so captions and subtitles stay out of the bottom UI zone.
const STAGE_TOP_VERTICAL = 330;

export const useLayout = () => {
  const {width, height} = useVideoConfig();
  return {horizontal: width > height, width, height};
};

// The 1080x1080 stage every scene is drawn in, centred in either format. Scenes may draw outside it
// (backgrounds) so the extra width (16:9) or height (9:16) is filled.
export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {width, height} = useLayout();
  return (
    <div style={{position: 'absolute', left: (width - 1080) / 2, top: width > height ? 0 : STAGE_TOP_VERTICAL, width: 1080, height: 1080}}>
      {children}
    </div>
  );
};

// Screen shake that decays over `dur` frames after `at`.
export const useShake = (at: number, strength = 18, dur = 12) => {
  const frame = useCurrentFrame();
  const k = frame - at;
  if (k < 0 || k > dur) return 'translate(0px, 0px)';
  const r = seeded(Math.floor(frame) * 7 + at);
  const s = strength * (1 - k / dur);
  return `translate(${(r() - 0.5) * 2 * s}px, ${(r() - 0.5) * 2 * s}px)`;
};

// Pop-in scale (overshoot) starting at `at`.
export const usePop = (at: number, stiffness = 220) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - at, fps, config: {damping: 9, stiffness, mass: 0.6}});
};

const outline = (px: number): React.CSSProperties => ({
  WebkitTextStroke: `${px}px ${C.ink}`,
  paintOrder: 'stroke fill',
});

// Classic meme caption (white Impact-style text, black outline), placed above the stage in 9:16
// and over the top/bottom of the stage in 16:9.
export const Caption: React.FC<{text: string; at?: number; position?: 'top' | 'bottom'; size?: number; color?: string}> = ({
  text, at = 0, position = 'top', size = 92, color = C.white,
}) => {
  const frame = useCurrentFrame();
  const pop = usePop(at);
  const {horizontal, height} = useLayout();
  if (frame < at) return null;
  const top = position === 'top' ? (horizontal ? 30 : 250) : horizontal ? 700 : 1230;
  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: size,
        lineHeight: 1.05,
        color,
        textTransform: 'uppercase',
        transform: `scale(${interpolate(pop, [0, 1], [1.8, 1])})`,
        opacity: Math.min(1, pop * 3),
        zIndex: 5000,
        maxHeight: height,
        ...outline(size * 0.14),
        textShadow: '0 8px 0 rgba(0,0,0,0.35)',
      }}
    >
      {text}
    </div>
  );
};

// Big label that punches in (for numbers, names, stamps).
export const Punch: React.FC<{
  at: number; x: number; y: number; children: React.ReactNode; size?: number; color?: string; bg?: string; rotate?: number;
}> = ({at, x, y, children, size = 110, color = C.yellow, bg, rotate = -6}) => {
  const frame = useCurrentFrame();
  const pop = usePop(at);
  if (frame < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${interpolate(pop, [0, 1], [0.2, 1])})`,
        fontFamily: FONT,
        fontSize: size,
        color,
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        background: bg,
        padding: bg ? `${size * 0.08}px ${size * 0.25}px` : undefined,
        border: bg ? `${size * 0.06}px solid ${C.ink}` : undefined,
        boxShadow: bg ? `${size * 0.08}px ${size * 0.08}px 0 ${C.ink}` : undefined,
        zIndex: 4000,
        ...outline(bg ? 0 : size * 0.12),
      }}
    >
      {children}
    </div>
  );
};

// Rolling number.
export const count = (frame: number, at: number, dur: number, value: number) =>
  Math.round(value * interpolate(frame, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
export const fr = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Sound effect at a scene-local frame.
export const Sfx: React.FC<{at: number; name: string; volume?: number}> = ({at, name, volume = 0.6}) => (
  <Sequence from={Math.max(0, at)} layout="none">
    <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
  </Sequence>
);

// Background that fills the whole frame whatever the format.
export const Sky: React.FC<{top?: string; bottom?: string}> = ({top = C.sky, bottom = '#BFE6F2'}) => (
  <AbsoluteFill style={{background: `linear-gradient(${top}, ${bottom})`}} />
);

type Chunk = {lines: Word[][]; s: number; e: number};
const paginate = (words: Word[], maxChars: number): Chunk[] => {
  const chunks: Chunk[] = [];
  let lines: Word[][] = [[]];
  const len = (l: Word[]) => l.map((w) => w.w).join(' ').length;
  const flush = () => {
    const all = lines.flat();
    if (all.length) chunks.push({lines, s: all[0].s, e: all[all.length - 1].e});
    lines = [[]];
  };
  for (const word of words) {
    const cur = lines[lines.length - 1];
    if (cur.length && len([...cur, word]) > maxChars) {
      if (lines.length === 2) flush();
      else lines.push([]);
    }
    lines[lines.length - 1].push(word);
    if (/[.!?…»]$/.test(word.w) && !/^([A-Z]\.)+$/.test(word.w) && word !== words[words.length - 1]) flush();
  }
  flush();
  return chunks;
};

// Voice-over subtitles: white with black outline, active word in yellow.
export const Subtitles: React.FC<{words: Word[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {horizontal} = useLayout();
  const t = frame / fps;
  const chunks = React.useMemo(() => paginate(words, horizontal ? 48 : 30), [words, horizontal]);
  const chunk = chunks[Math.max(0, chunks.findLastIndex((c) => c.s <= t))];
  if (!chunk) return null;
  const size = horizontal ? 50 : 58;
  return (
    <div
      style={{
        position: 'absolute',
        left: 30,
        right: 30,
        ...(horizontal ? {bottom: 34} : {top: 1440}),
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: size,
        lineHeight: 1.15,
        color: C.white,
        zIndex: 6000,
        ...outline(size * 0.16),
      }}
    >
      {chunk.lines.map((line, i) => (
        <div key={i}>
          {line.map((w, k) => (
            <span key={k} style={{color: t >= w.s && t < w.e ? C.yellow : C.white}}>
              {w.w}
              {k < line.length - 1 ? ' ' : ''}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
