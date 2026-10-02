import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useVideoConfig} from 'remotion';
import {C, seeded, Stage, TITLE, TornPaper, TYPE, useStep} from './components/TornPaper';
import {Stamp} from './components/Stamp';
import {Counter} from './components/Counter';
import {Tape} from './components/Tape';
import {Icon} from './Icon';

// Visual block spec, as written in data/cases.py (`v`).
export type Spec = {
  t: string;
  bg?: 'ink' | 'kraft' | 'night' | 'cream';
  title?: string;
  sub?: string;
  place?: string;
  region?: string;
  date?: string;
  label?: string;
  names?: string[];
  value?: number;
  prefix?: string;
  suffix?: string;
  heading?: string;
  sign?: string;
  stamp?: string;
  headline?: string;
  items?: {icon: string; label: string}[];
  icon?: string;
  text?: string;
  by?: string;
  lines?: string[];
  pairs?: string[];
};

const BG = {ink: C.ink, kraft: C.kraft, night: C.night, cream: C.cream};

// Scene-relative timing helpers (blocks animate as fractions of their scene).
const useScene = () => {
  const f = useStep();
  const {fps, durationInFrames} = useVideoConfig();
  const at = (fraction: number) => Math.round(durationInFrames * fraction);
  const pop = (start: number, damping = 14) => spring({frame: f - start, fps, config: {damping}});
  return {f, at, pop, durationInFrames};
};

const typed = (text: string, f: number, start: number, speed = 1.6) => text.slice(0, Math.max(0, Math.floor((f - start) / speed)));

// Font size that keeps a single Bebas line inside `width`.
const fit = (text: string, width: number, max: number) => Math.min(max, Math.floor(width / (Math.max(text.length, 1) * 0.42)));

const Strip: React.FC<{x: number; y: number; w: number; text: string; seed: number; color?: string; ink?: string; font?: string; size?: number; rotate?: number}> = ({
  x, y, w, text, seed, color = C.cream, ink = C.ink, font = TITLE, size, rotate = -1.5,
}) => {
  const s = size ?? (font === TITLE ? fit(text, w - 60, 84) : Math.min(46, Math.floor((w - 60) / (text.length * 0.6))));
  const h = Math.round(s * 1.45);
  return (
    <TornPaper x={x} y={y} w={w} h={h} seed={seed} color={color} rotate={rotate}>
      <div style={{fontFamily: font, fontSize: s, color: ink, textAlign: 'center', lineHeight: `${h + 4}px`, letterSpacing: font === TITLE ? 2 : 0, whiteSpace: 'nowrap'}}>{text}</div>
    </TornPaper>
  );
};

const SlideIn: React.FC<{p: number; from?: 'left' | 'right' | 'bottom' | 'top'; children: React.ReactNode}> = ({p, from = 'bottom', children}) => {
  const d = (1 - p) * 900;
  const t = from === 'left' ? `translateX(${-d}px)` : from === 'right' ? `translateX(${d}px)` : from === 'top' ? `translateY(${-d}px)` : `translateY(${d}px)`;
  return <div style={{position: 'absolute', inset: 0, transform: t}}>{children}</div>;
};

// ---------- blocks ----------

const Title: React.FC<{v: Spec}> = ({v}) => {
  const {f, pop} = useScene();
  const a = pop(0);
  const b = pop(10, 11);
  return (
    <>
      <SlideIn p={a} from="top">
        <TornPaper x={540} y={420} w={940} h={360} seed={11} color={C.kraft} rotate={1.5}>
          <div style={{fontFamily: TITLE, fontSize: fit(v.title ?? '', 860, 170), color: C.ink, textAlign: 'center', lineHeight: '360px', letterSpacing: 3}}>{v.title}</div>
        </TornPaper>
        <Tape x={110} y={260} rotate={-35} seed={1} />
      </SlideIn>
      {f >= 10 && (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${interpolate(b, [0, 1], [1.8, 1])})`, transformOrigin: '540px 690px', opacity: Math.min(1, b * 3)}}>
          <Strip x={540} y={690} w={760} text={v.sub ?? ''} seed={12} color={C.red} ink={C.cream} font={TYPE} rotate={-2} />
        </div>
      )}
    </>
  );
};

const STREETS = (() => {
  const r = seeded(77);
  return Array.from({length: 14}).map(() => ({x1: r() * 760, y1: r() * 600, x2: r() * 760, y2: r() * 600}));
})();

const Place: React.FC<{v: Spec}> = ({v}) => {
  const {f, at, pop} = useScene();
  const map = pop(0);
  const pin = pop(at(0.18), 9);
  return (
    <>
      <SlideIn p={map}>
        <TornPaper x={540} y={430} w={820} h={680} seed={21} color="#d9c7a3" rotate={-1}>
          <svg width={820} height={680}>
            {Array.from({length: 9}).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 80} x2={820} y2={i * 80} stroke={C.ink} strokeWidth={1} opacity={0.15} />
            ))}
            {Array.from({length: 11}).map((_, i) => (
              <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80} y2={680} stroke={C.ink} strokeWidth={1} opacity={0.15} />
            ))}
            {STREETS.map((s, i) => (
              <line key={i} x1={s.x1 + 30} y1={s.y1 + 40} x2={s.x2 + 30} y2={s.y2 + 40} stroke="#8a6d4a" strokeWidth={i % 3 ? 4 : 9} opacity={0.6} />
            ))}
            <path d="M0 560 Q200 520 400 580 T820 540 L820 680 L0 680 Z" fill="#4f86a8" opacity={0.35} />
          </svg>
        </TornPaper>
        <Tape x={170} y={110} rotate={-35} seed={2} />
      </SlideIn>
      {f >= at(0.18) && (
        <div style={{position: 'absolute', left: 540, top: 400 - (1 - pin) * 300, transform: 'translate(-50%, -100%)'}}>
          <svg width={90} height={130} viewBox="0 0 90 130">
            <path d="M45 125 C 30 90, 5 70, 5 45 A40 40 0 1 1 85 45 C 85 70, 60 90, 45 125 Z" fill={C.red} stroke={C.ink} strokeWidth={5} />
            <circle cx={45} cy={45} r={15} fill={C.cream} />
          </svg>
        </div>
      )}
      {f >= at(0.25) && <Strip x={540} y={560} w={Math.min(960, 160 + (v.place ?? '').length * 42)} text={v.place ?? ''} seed={22} rotate={-2} />}
      {f >= at(0.35) && <Strip x={540} y={830} w={760} text={typed(v.region ?? '', f, at(0.35))} seed={23} font={TYPE} size={40} rotate={1.5} color={C.ink} ink={C.cream} />}
      <Stamp x={850} y={130} start={at(0.45)} size={64} rotate={8} blend="normal">
        {v.date}
      </Stamp>
    </>
  );
};

const DateBlock: React.FC<{v: Spec}> = ({v}) => {
  const {f, at, pop} = useScene();
  const page = pop(0);
  const t = typed(v.date ?? '', f, 6, 1.4);
  return (
    <>
      <SlideIn p={page} from="top">
        <TornPaper x={540} y={430} w={760} h={560} seed={31} rotate={-2}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 110, background: C.red}} />
          {[180, 380, 580].map((x) => (
            <div key={x} style={{position: 'absolute', left: x - 18, top: -10, width: 36, height: 60, borderRadius: 18, background: C.ink}} />
          ))}
          <div style={{position: 'absolute', left: 30, right: 30, top: 170, textAlign: 'center', fontFamily: TYPE, fontSize: Math.min(96, Math.floor(1300 / Math.max(10, (v.date ?? '').length))), color: C.ink, lineHeight: 1.2}}>
            {t}
            <span style={{opacity: Math.floor(f / 6) % 2}}>_</span>
          </div>
        </TornPaper>
        <Tape x={180} y={170} rotate={-30} seed={3} />
      </SlideIn>
      {f >= at(0.3) && v.label && <Strip x={540} y={820} w={Math.min(980, 200 + v.label.length * 40)} text={v.label} seed={32} color={C.ink} ink={C.cream} rotate={1.5} />}
    </>
  );
};

const Names: React.FC<{v: Spec}> = ({v}) => {
  const {at, pop, f} = useScene();
  const names = v.names ?? [];
  const step = Math.min(170, 860 / Math.max(1, names.length + 1));
  return (
    <>
      {v.label && <Strip x={540} y={20} w={Math.min(900, 200 + v.label.length * 36)} text={v.label} seed={41} color={C.red} ink={C.cream} font={TYPE} size={40} rotate={-1} />}
      {names.map((n, i) => {
        const start = at(0.08 + (i / Math.max(1, names.length)) * 0.7);
        const p = pop(start);
        if (f < start) return null;
        return (
          <SlideIn key={n} p={p} from={i % 2 ? 'right' : 'left'}>
            <Strip x={540} y={170 + i * step} w={Math.min(960, 200 + n.length * 44)} text={n} seed={42 + i} rotate={i % 2 ? 1.5 : -1.5} />
          </SlideIn>
        );
      })}
    </>
  );
};

const CounterBlock: React.FC<{v: Spec}> = ({v}) => {
  const {f, at, pop} = useScene();
  const card = pop(0);
  const text = `${v.prefix ?? ''}${(v.value ?? 0).toLocaleString('en-US')}${v.suffix ?? ''}`;
  const size = Math.min(150, Math.floor(1500 / Math.max(6, text.length)));
  return (
    <>
      <SlideIn p={card}>
        <TornPaper x={540} y={430} w={900} h={520} seed={51} rotate={1}>
          <div style={{position: 'absolute', inset: 30, border: `3px dashed ${C.ink}`, opacity: 0.25}} />
        </TornPaper>
        <Tape x={130} y={200} rotate={-35} seed={5} />
        <Tape x={950} y={660} rotate={-35} seed={6} />
      </SlideIn>
      <Counter x={540} y={420} value={v.value ?? 0} prefix={v.prefix} suffix={v.suffix} start={at(0.08)} dur={Math.min(40, at(0.4))} size={size} rotate={-5} blend="normal" />
      {f >= at(0.4) && v.label && <Strip x={540} y={800} w={Math.min(980, 200 + v.label.length * 36)} text={v.label} seed={52} color={C.ink} ink={C.cream} font={TYPE} size={40} rotate={-1} />}
    </>
  );
};

const Letter: React.FC<{v: Spec}> = ({v}) => {
  const {f, at, pop} = useScene();
  const page = pop(0);
  const draw = interpolate(f, [at(0.15), at(0.7)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const r = seeded(61);
  const rows = Array.from({length: 7}).map((_, i) => {
    let d = `M60 ${250 + i * 70}`;
    for (let x = 60; x < 620; x += 40) d += ` q 10 ${-8 - r() * 14} 20 0 t 20 0`;
    return d;
  });
  return (
    <>
      <SlideIn p={page}>
        <TornPaper x={540} y={480} w={700} h={860} seed={62} color="#efe4c4" rotate={-2}>
          <div style={{position: 'absolute', left: 50, top: 60, fontFamily: TYPE, fontSize: 64, color: '#4a2a1a'}}>{typed(v.heading ?? '', f, 4, 2)}</div>
          <svg width={700} height={860} style={{position: 'absolute', inset: 0}}>
            {rows.map((d, i) => (
              <path key={i} d={d} stroke="#6b2a1e" strokeWidth={4} fill="none" pathLength={1} strokeDasharray={`${Math.max(0, Math.min(1, draw * 7 - i))} 1`} opacity={0.8} />
            ))}
          </svg>
          {v.sign && f >= at(0.7) && (
            <div style={{position: 'absolute', right: 50, bottom: 50, fontFamily: TYPE, fontSize: 56, color: '#6b2a1e', fontStyle: 'italic', transform: 'rotate(-4deg)'}}>{v.sign}</div>
          )}
        </TornPaper>
        <Tape x={250} y={60} rotate={-20} seed={7} />
      </SlideIn>
      {v.stamp && (
        <Stamp x={760} y={860} start={at(0.55)} size={80} rotate={-10} blend="normal">
          {v.stamp}
        </Stamp>
      )}
    </>
  );
};

const Newspaper: React.FC<{v: Spec}> = ({v}) => {
  const {f, pop} = useScene();
  const s = pop(0, 12);
  return (
    <div style={{position: 'absolute', left: 540, top: 470, transform: `translate(-50%, -50%) rotate(${-4 + (1 - s) * 540}deg) scale(${s})`}}>
      <div style={{width: 880, background: '#f1ece0', border: `6px solid ${C.ink}`, padding: 34, boxSizing: 'border-box', boxShadow: '14px 14px 0 rgba(0,0,0,0.5)'}}>
        <div style={{fontFamily: TITLE, fontSize: 64, textAlign: 'center', borderBottom: `5px double ${C.ink}`, letterSpacing: 6, color: C.ink}}>EXTRA!</div>
        <div style={{fontFamily: TITLE, fontSize: Math.min(130, Math.floor(2600 / Math.max(12, (v.headline ?? '').length))), lineHeight: 1, textAlign: 'center', margin: '26px 0', color: C.ink}}>{v.headline}</div>
        <div style={{display: 'flex', gap: 24}}>
          {[0, 1, 2].map((c) => (
            <div key={c} style={{flex: 1}}>
              {Array.from({length: 7}).map((_, i) => (
                <div key={i} style={{height: 9, background: '#b9b2a2', marginTop: 12, width: `${70 + ((i * 37 + c * 13) % 30)}%`}} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{opacity: f > 0 ? 1 : 0}} />
    </div>
  );
};

const Evidence: React.FC<{v: Spec}> = ({v}) => {
  const {f, at, pop} = useScene();
  const items = v.items ?? [];
  const n = items.length;
  const size = n === 1 ? 520 : n === 2 ? 430 : 300;
  const pos = n === 1 ? [[540, 470]] : n === 2 ? [[300, 330], [780, 640]] : [[260, 250], [800, 420], [400, 760]];
  return (
    <>
      {items.map((it, i) => {
        const start = at(0.05 + i * 0.22);
        const p = pop(start);
        if (f < start) return null;
        const [x, y] = pos[i];
        return (
          <SlideIn key={i} p={p} from={i % 2 ? 'right' : 'left'}>
            <TornPaper x={x} y={y} w={size} h={size + 60} seed={70 + i} color="rgba(226,232,238,0.93)" rotate={i % 2 ? 3 : -3}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 44, background: C.red}} />
              <div style={{position: 'absolute', left: 16, top: 4, fontFamily: TITLE, fontSize: 36, color: C.cream, letterSpacing: 3}}>EVIDENCE</div>
              <div style={{position: 'absolute', left: (size - size * 0.62) / 2, top: 64}}>
                <Icon name={it.icon} size={size * 0.62} />
              </div>
              <div style={{position: 'absolute', left: 10, right: 10, bottom: 18, textAlign: 'center', fontFamily: TYPE, fontSize: Math.min(34, Math.floor((size - 20) / (it.label.length * 0.62))), color: C.ink}}>{it.label}</div>
            </TornPaper>
          </SlideIn>
        );
      })}
    </>
  );
};

const IconBlock: React.FC<{v: Spec}> = ({v}) => {
  const {f, at, pop} = useScene();
  const card = pop(0);
  return (
    <>
      <SlideIn p={card} from="top">
        <TornPaper x={540} y={400} w={640} h={640} seed={81} color={C.cream} rotate={2}>
          <div style={{position: 'absolute', left: 70, top: 70, transform: `scale(${interpolate(f, [0, 200], [1, 1.06], {extrapolateRight: 'clamp'})})`}}>
            <Icon name={v.icon ?? 'magnifier'} size={500} />
          </div>
        </TornPaper>
        <Tape x={250} y={90} rotate={-30} seed={8} />
        <Tape x={830} y={700} rotate={-30} seed={9} />
      </SlideIn>
      {f >= at(0.2) && v.label && <Strip x={540} y={800} w={Math.min(980, 200 + v.label.length * 40)} text={v.label} seed={82} color={C.red} ink={C.cream} rotate={-2} />}
      {f >= at(0.4) && v.sub && <Strip x={540} y={960} w={Math.min(980, 160 + v.sub.length * 26)} text={typed(v.sub, f, at(0.4), 1.2)} seed={83} font={TYPE} size={36} rotate={1.5} />}
    </>
  );
};

const WALL = (() => {
  const r = seeded(909);
  const cards = Array.from({length: 35}).map((_, i) => ({x: 110 + (i % 5) * 215 + (r() - 0.5) * 30, y: 60 + Math.floor(i / 5) * 125 + (r() - 0.5) * 20, rot: (r() - 0.5) * 8, o: r()}));
  const strings = Array.from({length: 12}).map(() => [Math.floor(r() * 35), Math.floor(r() * 35)]);
  return {cards, strings};
})();

const Suspects: React.FC<{v: Spec}> = ({v}) => {
  const {f, at} = useScene();
  const shown = interpolate(f, [0, at(0.45)], [0, 1], {extrapolateRight: 'clamp'});
  const strings = interpolate(f, [at(0.3), at(0.75)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      {WALL.cards.map((c, i) =>
        c.o <= shown ? (
          <TornPaper key={i} x={c.x} y={c.y} w={170} h={104} seed={900 + i} rotate={c.rot} rough={5}>
            <svg width={170} height={104}>
              <circle cx={42} cy={42} r={18} fill={C.ink} opacity={0.75} />
              <path d="M16 100 Q42 60 68 100 Z" fill={C.ink} opacity={0.75} />
              <text x={90} y={50} fontFamily={TITLE} fontSize={42} fill={C.ink} opacity={0.6}>?</text>
              <rect x={90} y={64} width={60} height={6} fill={C.ink} opacity={0.35} />
              <rect x={90} y={80} width={48} height={6} fill={C.ink} opacity={0.35} />
            </svg>
            <div style={{position: 'absolute', left: 77, top: -8, width: 16, height: 16, borderRadius: 8, background: C.red, boxShadow: '0 2px 2px rgba(0,0,0,0.5)'}} />
          </TornPaper>
        ) : null,
      )}
      <svg width={1080} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {WALL.strings.map(([a, b], i) => {
          const A = WALL.cards[a];
          const B = WALL.cards[b];
          return i / WALL.strings.length < strings ? <line key={i} x1={A.x} y1={A.y - 52} x2={B.x} y2={B.y - 52} stroke={C.red} strokeWidth={4} /> : null;
        })}
      </svg>
      <Stamp x={540} y={890} start={at(0.45)} size={Math.min(110, Math.floor(1700 / Math.max(8, (v.label ?? '').length)))} rotate={-6} blend="normal">
        {v.label}
      </Stamp>
    </>
  );
};

const Quote: React.FC<{v: Spec}> = ({v}) => {
  const {f, at, pop} = useScene();
  const card = pop(0);
  const text = v.text ?? '';
  return (
    <>
      <SlideIn p={card}>
        <TornPaper x={540} y={430} w={940} h={600} seed={91} color={C.cream} rotate={-1.5}>
          <div style={{position: 'absolute', left: 40, top: 10, fontFamily: TITLE, fontSize: 220, color: C.red, lineHeight: 1}}>“</div>
          <div style={{position: 'absolute', left: 60, right: 60, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: TITLE, fontSize: Math.min(140, Math.floor(3400 / Math.max(10, text.length))), lineHeight: 1.05, color: C.ink}}>
            {typed(text, f, 6, 1.3)}
          </div>
        </TornPaper>
        <Tape x={140} y={160} rotate={-35} seed={10} />
      </SlideIn>
      {f >= at(0.4) && v.by && <Strip x={540} y={850} w={Math.min(1000, 140 + v.by.length * 24)} text={v.by} seed={92} font={TYPE} size={32} rotate={1.5} />}
    </>
  );
};

const GLYPHS = 'ΔΘΛΞΠΣΦΨΩ+/#%&@KRYJ⊕◊▲●■◄►Ж';
const Cipher: React.FC<{v: Spec}> = ({v}) => {
  const {f, at, pop} = useScene();
  const card = pop(0);
  const r = seeded(v.label?.length ?? 1);
  const grid = Array.from({length: 8 * 9}).map(() => GLYPHS[Math.floor(r() * GLYPHS.length)]);
  const shown = Math.floor(interpolate(f, [0, at(0.6)], [0, grid.length], {extrapolateRight: 'clamp'}));
  return (
    <>
      <SlideIn p={card}>
        <TornPaper x={540} y={500} w={820} h={760} seed={101} color={C.cream} rotate={1.5}>
          <div style={{position: 'absolute', left: 50, top: 60, right: 50, display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', rowGap: 14, fontFamily: TYPE, fontSize: 56, color: C.ink, textAlign: 'center'}}>
            {grid.map((g, i) => (
              <span key={i} style={{opacity: i < shown ? 1 : 0, color: i % 11 === 0 ? C.red : C.ink}}>{g}</span>
            ))}
          </div>
        </TornPaper>
        <Tape x={180} y={140} rotate={-30} seed={11} />
      </SlideIn>
      {v.label && <Strip x={540} y={50} w={Math.min(900, 200 + v.label.length * 40)} text={v.label} seed={102} color={C.red} ink={C.cream} rotate={-2} />}
      {v.sub && (
        <Stamp x={540} y={940} start={at(0.5)} size={Math.min(80, Math.floor(1400 / Math.max(8, v.sub.length)))} rotate={-6} blend="normal">
          {v.sub}
        </Stamp>
      )}
    </>
  );
};

const FinalStamp: React.FC<{v: Spec; title: string; year: string}> = ({v, title, year}) => {
  const {f, at, pop} = useScene();
  const folder = pop(0);
  const k = f - at(0.3);
  const r = seeded(Math.floor(f));
  const shake = k >= 0 && k < 10 ? (10 - k) * 1.8 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${(r() - 0.5) * shake}px, ${(r() - 0.5) * shake}px)`}}>
      <SlideIn p={folder}>
        <TornPaper x={540} y={460} w={880} h={760} seed={111} color={C.kraft} rotate={2}>
          <div style={{position: 'absolute', left: 60, top: 60, right: 60, height: 150, background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: TYPE, fontSize: Math.min(48, Math.floor(1300 / Math.max(10, title.length))), color: C.ink, textAlign: 'center', padding: '0 20px'}}>
            CASE FILE · {title}
          </div>
          <div style={{position: 'absolute', left: 60, bottom: 80, fontFamily: TYPE, fontSize: 42, color: C.ink, opacity: 0.8}}>{year}</div>
          {[300, 360, 420, 480].map((y) => (
            <div key={y} style={{position: 'absolute', left: 60, right: 60 + (y % 120), top: y, height: 4, background: C.ink, opacity: 0.25}} />
          ))}
        </TornPaper>
        <Tape x={130} y={110} rotate={-35} seed={12} />
      </SlideIn>
      <Stamp x={540} y={520} start={at(0.3)} size={Math.min(170, Math.floor(1700 / Math.max(6, (v.text ?? '').length)))} rotate={-12} blend="normal">
        {v.text}
      </Stamp>
      {f >= at(0.5) && v.sub && <Strip x={540} y={950} w={Math.min(980, 160 + v.sub.length * 28)} text={v.sub} seed={112} font={TYPE} size={38} color={C.ink} ink={C.cream} rotate={-1} />}
    </div>
  );
};

const Silhouette: React.FC<{v: Spec}> = ({v}) => {
  const {f, at, pop} = useScene();
  const card = pop(0);
  const q = pop(at(0.25), 9);
  return (
    <>
      <SlideIn p={card} from="top">
        <TornPaper x={540} y={420} w={620} h={720} seed={121} color="#1f2d40" rotate={-2}>
          <svg width={620} height={720} viewBox="0 0 620 720">
            <path d="M80 720 Q100 520 230 480 L310 510 L390 480 Q520 520 540 720 Z" fill="#0b0b0b" />
            <ellipse cx={310} cy={330} rx={120} ry={140} fill="#0b0b0b" />
            <path d="M150 250 Q310 200 470 250 L440 270 Q310 235 180 270 Z" fill="#0b0b0b" />
            <path d="M200 255 Q310 120 420 255 Z" fill="#0b0b0b" />
          </svg>
        </TornPaper>
        <Tape x={290} y={70} rotate={-25} seed={13} />
      </SlideIn>
      {f >= at(0.25) && (
        <div style={{position: 'absolute', left: 540, top: 430, transform: `translate(-50%, -50%) scale(${q})`, fontFamily: TITLE, fontSize: 300, color: C.red, textShadow: `6px 6px 0 ${C.ink}`}}>?</div>
      )}
      {f >= at(0.35) && v.label && <Strip x={540} y={880} w={Math.min(980, 200 + v.label.length * 38)} text={v.label} seed={122} color={C.cream} rotate={1.5} />}
    </>
  );
};

const Helix: React.FC<{frame: number}> = ({frame}) => (
  <svg width={260} height={620}>
    {Array.from({length: 20}).map((_, i) => {
      const y = 15 + i * 31;
      const ph = i * 0.55 + frame / 12;
      const a = 130 + Math.sin(ph) * 105;
      const b = 130 - Math.sin(ph) * 105;
      const front = Math.cos(ph) > 0;
      return (
        <g key={i}>
          <line x1={a} y1={y} x2={b} y2={y} stroke={C.kraft} strokeWidth={6} />
          <circle cx={a} cy={y} r={front ? 13 : 8} fill={C.red} />
          <circle cx={b} cy={y} r={front ? 8 : 13} fill={C.cream} stroke={C.ink} strokeWidth={2} />
        </g>
      );
    })}
  </svg>
);

const Dna: React.FC<{v: Spec}> = ({v}) => {
  const {f, at, pop} = useScene();
  const card = pop(0);
  return (
    <>
      <SlideIn p={card} from="left">
        <TornPaper x={260} y={440} w={320} h={700} seed={131} color={C.night} rotate={-2}>
          <div style={{position: 'absolute', left: 30, top: 40}}>
            <Helix frame={f} />
          </div>
        </TornPaper>
      </SlideIn>
      {f >= at(0.15) && <Strip x={720} y={360} w={Math.min(640, 140 + (v.label ?? '').length * 40)} text={v.label ?? ''} seed={132} color={C.red} ink={C.cream} rotate={2} />}
      {f >= at(0.35) && v.sub && <Strip x={700} y={560} w={Math.min(640, 120 + v.sub.length * 22)} text={typed(v.sub, f, at(0.35), 1.2)} seed={133} font={TYPE} size={30} rotate={-1.5} />}
    </>
  );
};

const Court: React.FC<{v: Spec}> = ({v}) => {
  const {f, at, pop} = useScene();
  const lines = v.lines ?? [];
  const hit = interpolate(f, [at(0.06), at(0.1), at(0.14)], [-40, 8, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      <div style={{position: 'absolute', left: 620, top: -60, transformOrigin: '80% 80%', transform: `rotate(${hit}deg)`}}>
        <svg width={380} height={300}>
          <rect x={40} y={60} width={200} height={90} rx={16} fill="#6b4a2a" stroke={C.cream} strokeWidth={4} />
          <rect x={130} y={140} width={26} height={150} rx={10} fill="#8a6038" stroke={C.cream} strokeWidth={4} transform="rotate(-35 143 150)" />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 560, top: 210, width: 300, height: 40, background: '#6b4a2a', border: `4px solid ${C.cream}`}} />
      {lines.map((l, i) => {
        const start = at(0.12 + i * 0.2);
        const p = pop(start);
        if (f < start) return null;
        return (
          <SlideIn key={i} p={p} from={i % 2 ? 'right' : 'left'}>
            <Strip x={540} y={390 + i * 180} w={Math.min(980, 200 + l.length * 42)} text={l} seed={140 + i} color={i === lines.length - 1 ? C.red : C.cream} ink={i === lines.length - 1 ? C.cream : C.ink} rotate={i % 2 ? 1.5 : -1.5} />
          </SlideIn>
        );
      })}
    </>
  );
};

const Letters: React.FC<{v: Spec}> = ({v}) => {
  const {f, at, pop} = useScene();
  const pairs = v.pairs ?? [];
  return (
    <>
      {v.label && <Strip x={540} y={30} w={Math.min(900, 200 + v.label.length * 36)} text={v.label} seed={151} color={C.red} ink={C.cream} font={TYPE} size={40} rotate={-1} />}
      {pairs.map((pr, i) => {
        const start = at(0.1 + i * 0.22);
        const p = pop(start);
        if (f < start) return null;
        return (
          <SlideIn key={i} p={p} from={i % 2 ? 'right' : 'left'}>
            <Strip x={540} y={260 + i * 250} w={Math.min(980, 260 + pr.length * 50)} text={pr} seed={152 + i} rotate={i % 2 ? 2 : -2} size={pr.length > 8 ? 90 : 140} />
          </SlideIn>
        );
      })}
    </>
  );
};

export type Photo = {file: string; label: string; credit: string};

// Real archive photo (Wikimedia Commons, free licence) pinned as a torn print, with its credit on screen.
const PhotoBlock: React.FC<{photo: Photo}> = ({photo}) => {
  const {f, at, pop} = useScene();
  const card = pop(0);
  const zoom = interpolate(f, [0, 300], [1.0, 1.12], {extrapolateRight: 'clamp'});
  return (
    <>
      <SlideIn p={card} from="top">
        <TornPaper x={540} y={430} w={900} h={880} seed={161} color={C.cream} rotate={-1.5}>
          <div style={{position: 'absolute', left: 26, top: 26, right: 26, bottom: 26, overflow: 'hidden', background: C.ink}}>
            <Img src={staticFile(photo.file)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, filter: 'sepia(0.35) contrast(1.08) saturate(0.8)'}} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '8px 14px', background: 'rgba(0,0,0,0.6)', fontFamily: TYPE, fontSize: 20, color: C.cream, lineHeight: 1.25}}>
              Photo: {photo.credit}
            </div>
          </div>
        </TornPaper>
        <Tape x={150} y={10} rotate={-35} seed={14} />
        <Tape x={930} y={850} rotate={-35} seed={15} />
      </SlideIn>
      {f >= at(0.2) && <Strip x={540} y={940} w={Math.min(980, 200 + photo.label.length * 40)} text={photo.label} seed={162} color={C.red} ink={C.cream} rotate={-2} />}
    </>
  );
};

// Small case-file tag shown at the top of every scene.
const Tag: React.FC<{title: string; year: string}> = ({title, year}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: -90, display: 'flex', justifyContent: 'center'}}>
    <div style={{fontFamily: TYPE, fontSize: 28, color: C.cream, background: 'rgba(0,0,0,0.55)', padding: '6px 18px', letterSpacing: 2}}>
      CASE FILE · {title} · {year}
    </div>
  </div>
);

export const Block: React.FC<{v: Spec; title: string; year: string; photo?: Photo}> = ({v, title, year, photo}) => {
  const body = (() => {
    if (photo) return <PhotoBlock photo={photo} />;
    switch (v.t) {
      case 'title': return <Title v={v} />;
      case 'place': return <Place v={v} />;
      case 'date': return <DateBlock v={v} />;
      case 'names': return <Names v={v} />;
      case 'counter': return <CounterBlock v={v} />;
      case 'letter': return <Letter v={v} />;
      case 'newspaper': return <Newspaper v={v} />;
      case 'evidence': return <Evidence v={v} />;
      case 'icon': return <IconBlock v={v} />;
      case 'suspects': return <Suspects v={v} />;
      case 'quote': return <Quote v={v} />;
      case 'cipher': return <Cipher v={v} />;
      case 'stamp': return <FinalStamp v={v} title={title} year={year} />;
      case 'silhouette': return <Silhouette v={v} />;
      case 'dna': return <Dna v={v} />;
      case 'court': return <Court v={v} />;
      case 'letters': return <Letters v={v} />;
      default: return null;
    }
  })();
  return (
    <AbsoluteFill style={{background: BG[v.bg ?? 'ink']}}>
      <Stage>
        {v.t !== 'stamp' && <Tag title={title} year={year} />}
        {body}
      </Stage>
    </AbsoluteFill>
  );
};
