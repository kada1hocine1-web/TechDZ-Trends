import React from 'react';
import {AbsoluteFill, Audio, Freeze, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {springTiming, TransitionSeries} from '@remotion/transitions';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import {C, seeded} from './components/TornPaper';
import {PaperTexture} from './components/PaperTexture';
import {Subtitles} from './components/Subtitles';
import {Block, type Spec} from './blocks';

export type Word = {w: string; s: number; e: number};
export type CaseData = {slug: string; title: string; place: string; year: string; lines: {id: string; text: string; v: Spec}[]};
export type Timings = {fps: number; breathFrames: number; scenes: {id: string; file: string | null; seconds: number; frames: number; words: Word[]}[]};

export const FREEZE_FRAMES = 60;
const TEAR_FRAMES = 15;

export const totalFrames = (t: Timings) => t.scenes.reduce((a, s) => a + s.frames, 0) + FREEZE_FRAMES;

const tearEdge = (x: number, h: number) => {
  const r = seeded(305);
  const pts: [number, number][] = [];
  for (let y = -20; y <= h + 20; y += 16) pts.push([x + (r() - 0.5) * 34 + Math.sin(y / 140) * 26, y]);
  return pts;
};

const Tear: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({children, presentationDirection, presentationProgress}) => {
  const {width, height} = useVideoConfig();
  if (presentationDirection === 'exiting') return <AbsoluteFill>{children}</AbsoluteFill>;
  const x = interpolate(presentationProgress, [0, 1], [width + 60, -80]);
  const edge = tearEdge(x, height);
  const clip = `M${width + 200},-50 L${edge.map(([a, b]) => `${a.toFixed(1)},${b}`).join(' L')} L${width + 200},${height + 50} Z`;
  const rim = edge.map(([a, b]) => `${(a - 7).toFixed(1)},${b}`).join(' L');
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: `path('${clip}')`}}>{children}</AbsoluteFill>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, filter: 'drop-shadow(-8px 0 10px rgba(0,0,0,0.45))'}}>
        <path d={`M${rim}`} stroke={C.fiber} strokeWidth={12} fill="none" strokeLinejoin="round" />
      </svg>
    </AbsoluteFill>
  );
};
const tear = (): TransitionPresentation<Record<string, never>> => ({component: Tear, props: {}});

const KenBurns: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const s = interpolate(frame, [0, durationInFrames], [1, 1.06], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{transform: `scale(${s})`}}>{children}</AbsoluteFill>;
};

// One vertical (9:16) true-crime short, driven entirely by the case data and its measured timings.
export const CaseVideo: React.FC<{data: CaseData; timings: Timings}> = ({data, timings}) => {
  const scenes = timings.scenes;
  const total = totalFrames(timings);
  const starts = scenes.map((_, i) => scenes.slice(0, i).reduce((a, s) => a + s.frames, 0));
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Freeze frame={total - FREEZE_FRAMES - 1} active={(f) => f >= total - FREEZE_FRAMES}>
        <TransitionSeries>
          {scenes.map((t, i) => {
            const last = i === scenes.length - 1;
            return (
              <React.Fragment key={t.id}>
                <TransitionSeries.Sequence durationInFrames={t.frames + (last ? FREEZE_FRAMES : TEAR_FRAMES)}>
                  <KenBurns>
                    <Block v={data.lines[i].v} title={data.title} year={data.year} />
                  </KenBurns>
                  <Subtitles words={t.words} />
                </TransitionSeries.Sequence>
                {!last && <TransitionSeries.Transition presentation={tear()} timing={springTiming({config: {damping: 200}, durationInFrames: TEAR_FRAMES})} />}
              </React.Fragment>
            );
          })}
        </TransitionSeries>
        <PaperTexture />
      </Freeze>
      {scenes.map((t, i) =>
        t.file ? (
          <Sequence key={t.id} from={starts[i]} durationInFrames={t.frames} layout="none">
            <Audio src={staticFile(t.file)} />
          </Sequence>
        ) : null,
      )}
      {scenes.slice(1).map((t, i) => (
        <Sequence key={t.id} from={starts[i + 1]} durationInFrames={15} layout="none">
          <Audio src={staticFile('shared/tear.mp3')} volume={0.45} />
        </Sequence>
      ))}
      <Audio
        src={staticFile('shared/drone.mp3')}
        loop
        volume={(f) => Math.pow(10, -24 / 20) * interpolate(f, [0, 30, total - 45, total], [0, 1, 1, 0], {extrapolateRight: 'clamp'})}
      />
    </AbsoluteFill>
  );
};
