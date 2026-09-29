import React from 'react';
import {AbsoluteFill, Audio, Freeze, Sequence, staticFile} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {Subtitles} from './components/Meme';
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

const SCENES = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10];
const CUT_FRAMES = 8;

export const totalFrames = () => TIMINGS.reduce((a, s) => a + s.frames, 0) + FREEZE_FRAMES;


export const Video: React.FC = () => {
  const total = totalFrames();
  const starts = TIMINGS.map((_, i) => TIMINGS.slice(0, i).reduce((a, s) => a + s.frames, 0));
  return (
    <AbsoluteFill style={{background: '#111'}}>
      <Freeze frame={total - FREEZE_FRAMES - 1} active={(f) => f >= total - FREEZE_FRAMES}>
        <TransitionSeries>
          {TIMINGS.map((t, i) => {
            const Scene = SCENES[i];
            const last = i === TIMINGS.length - 1;
            // Each sequence is extended by the cut overlap so scene i+1 starts exactly with its voice line.
            return (
              <React.Fragment key={t.id}>
                <TransitionSeries.Sequence durationInFrames={t.frames + (last ? FREEZE_FRAMES : CUT_FRAMES)}>
                  <Scene />
                  <Subtitles words={t.words} />
                </TransitionSeries.Sequence>
                {/* Fast meme cuts: alternate slide and wipe. */}
                {!last && i % 2 === 0 && (
                  <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={linearTiming({durationInFrames: CUT_FRAMES})} />
                )}
                {!last && i % 2 === 1 && (
                  <TransitionSeries.Transition
                    presentation={wipe({direction: i % 4 === 1 ? 'from-top-left' : 'from-bottom-right'})}
                    timing={linearTiming({durationInFrames: CUT_FRAMES})}
                  />
                )}
              </React.Fragment>
            );
          })}
        </TransitionSeries>
      </Freeze>
      {TIMINGS.map((t, i) =>
        t.file ? (
          <Sequence key={t.id} from={starts[i]} durationInFrames={t.frames} layout="none">
            <Audio src={staticFile(`audio/${t.file}`)} />
          </Sequence>
        ) : null,
      )}
    </AbsoluteFill>
  );
};
