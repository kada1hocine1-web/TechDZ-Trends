import React from 'react';
import {AbsoluteFill, Audio, Freeze, interpolate, Sequence, Series, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {springTiming, TransitionSeries} from '@remotion/transitions';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import {C, seeded, TITLE, TornPaper, TYPE} from './components/TornPaper';
import {Tape} from './components/Tape';
import {Intro, INTRO_FRAMES, LOGO} from './channel/Intro';
import {Outro, OUTRO_FRAMES} from './channel/Outro';
import {PaperTexture} from './components/PaperTexture';
import {Subtitles} from './components/Subtitles';
import {FREEZE_FRAMES, TIMINGS} from './data/script';
import {S01} from './scenes/S01';
import {S02} from './scenes/S02';
import {S03} from './scenes/S03';
import {S04} from './scenes/S04';
import {S05} from './scenes/S05';
import {S06} from './scenes/S06';
import {S07} from './scenes/S07';
import {S08} from './scenes/S08';
import {S09} from './scenes/S09';
import {S10} from './scenes/S10';
import {S11} from './scenes/S11';
import {S12} from './scenes/S12';

const SCENES = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12];
export const TEAR_FRAMES = 15;

export const totalFrames = () => TIMINGS.reduce((a, s) => a + s.frames, 0) + FREEZE_FRAMES;
export const wideFrames = () => INTRO_FRAMES + totalFrames() + OUTRO_FRAMES;

// Vertical torn edge x-positions for a given sweep position.
const tearEdge = (x: number, h: number) => {
  const r = seeded(305);
  const pts: [number, number][] = [];
  for (let y = -20; y <= h + 20; y += 16) pts.push([x + (r() - 0.5) * 34 + Math.sin(y / 140) * 26, y]);
  return pts;
};

const Tear: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children, presentationDirection, presentationProgress,
}) => {
  const width = 1080;
  const height = 1920;
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

// Slow Ken Burns push-in over each scene.
const KenBurns: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const s = interpolate(frame, [0, durationInFrames], [1, 1.06], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{transform: `scale(${s})`}}>{children}</AbsoluteFill>;
};

export const Video: React.FC = () => {
  const total = totalFrames();
  const starts = TIMINGS.map((_, i) => TIMINGS.slice(0, i).reduce((a, s) => a + s.frames, 0));
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Freeze frame={total - FREEZE_FRAMES - 1} active={(f) => f >= total - FREEZE_FRAMES}>
        <TransitionSeries>
          {TIMINGS.map((t, i) => {
            const Scene = SCENES[i];
            const last = i === TIMINGS.length - 1;
            // Each sequence is extended by the tear overlap so scene i+1 starts exactly with its voice line.
            const dur = t.frames + (last ? FREEZE_FRAMES : TEAR_FRAMES);
            return (
              <React.Fragment key={t.id}>
                <TransitionSeries.Sequence durationInFrames={dur}>
                  <KenBurns>
                    <Scene />
                  </KenBurns>
                  <Subtitles words={t.words} />
                </TransitionSeries.Sequence>
                {!last && (
                  <TransitionSeries.Transition
                    presentation={tear()}
                    timing={springTiming({config: {damping: 200}, durationInFrames: TEAR_FRAMES})}
                  />
                )}
              </React.Fragment>
            );
          })}
        </TransitionSeries>
        <PaperTexture />
      </Freeze>
      {TIMINGS.map((t, i) =>
        t.file ? (
          <Sequence key={t.id} from={starts[i]} durationInFrames={t.frames} layout="none">
            <Audio src={staticFile(`audio/${t.file}`)} />
          </Sequence>
        ) : null,
      )}
      {TIMINGS.slice(1).map((t, i) => (
        <Sequence key={t.id} from={starts[i + 1]} durationInFrames={15} layout="none">
          <Audio src={staticFile('audio/tear.mp3')} volume={0.5} />
        </Sequence>
      ))}
      <Audio
        src={staticFile('audio/drone.mp3')}
        loop
        volume={(f) => Math.pow(10, -24 / 20) * interpolate(f, [0, 30, total - 45, total], [0, 1, 1, 0], {extrapolateRight: 'clamp'})}
      />
    </AbsoluteFill>
  );
};

// 16:9 copy: the vertical story (drawn for 1080x1920) sits in the centre at full height, framed by
// kraft paper panels, between the Cultura Generalis intro and the subscribe outro.
const SCALE = 1080 / 1920;
const Framed: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inL = spring({frame, fps, config: {damping: 15}});
  const inR = spring({frame: frame - 8, fps, config: {damping: 15}});
  const M = 1080 * 0.2;
  return (
    <AbsoluteFill style={{background: C.kraft}}>
      <PaperTexture />
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - inL) * -700}px)`}}>
        <TornPaper x={330} y={360} w={440} h={300} seed={901} rotate={-3}>
          <div style={{fontFamily: TITLE, fontSize: 110, color: C.ink, textAlign: 'center', lineHeight: 1, paddingTop: 36}}>L'ÉNIGME</div>
        </TornPaper>
        <TornPaper x={345} y={540} w={480} h={140} seed={902} color={C.red} rotate={2}>
          <div style={{fontFamily: TITLE, fontSize: 120, color: C.cream, textAlign: 'center', lineHeight: '150px'}}>D.B. COOPER</div>
        </TornPaper>
        <TornPaper x={320} y={720} w={400} h={80} seed={903} rotate={-1.5}>
          <div style={{fontFamily: TYPE, fontSize: 40, color: C.ink, textAlign: 'center', lineHeight: '80px'}}>24 NOVEMBRE 1971</div>
        </TornPaper>
        <Tape x={130} y={230} rotate={-35} seed={9} />
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - inR) * 700}px)`}}>
        <div
          style={{
            position: 'absolute',
            left: 1590 - M,
            top: 540 - M,
            width: M * 2,
            height: M * 2,
            borderRadius: '50%',
            backgroundImage: `url(${LOGO})`,
            backgroundSize: `${2000 * (M / 470)}px auto`,
            backgroundPosition: `${-(1000 * (M / 470) - M)}px ${-(530 * (M / 470) - M)}px`,
            boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
          }}
        />
        <TornPaper x={1590} y={820} w={420} h={80} seed={904} rotate={2}>
          <div style={{fontFamily: TYPE, fontSize: 34, color: C.ink, textAlign: 'center', lineHeight: '80px'}}>AFFAIRE NORJAK</div>
        </TornPaper>
      </div>
      <div
        style={{
          position: 'absolute',
          left: (1920 - 1080 * SCALE) / 2,
          top: 0,
          width: 1080,
          height: 1920,
          transform: `scale(${SCALE})`,
          transformOrigin: '0 0',
          overflow: 'hidden',
          outline: `14px solid ${C.ink}`,
          boxShadow: '0 0 60px rgba(0,0,0,0.6)',
        }}
      >
        <Video />
      </div>
    </AbsoluteFill>
  );
};

export const Wide: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={INTRO_FRAMES}>
      <Intro />
    </Series.Sequence>
    <Series.Sequence durationInFrames={totalFrames()}>
      <Framed />
    </Series.Sequence>
    <Series.Sequence durationInFrames={OUTRO_FRAMES}>
      <Outro />
    </Series.Sequence>
  </Series>
);
