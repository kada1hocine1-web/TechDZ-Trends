import { getAudioDurationInSeconds } from "@remotion/media-utils";
import React from "react";
import { Composition, staticFile, type CalculateMetadataFunction } from "remotion";
import { EPISODES } from "./episodes/index.ts";
import { EpisodeVideo, type EpisodeProps } from "./EpisodeVideo.tsx";
import { FPS, HEIGHT, WIDTH, audioPath, totalFrames } from "./timing.ts";

// Scene length = audio length when public/audio/episode_NN/scene_XX.mp3 exists, otherwise the estimate.
const calculateMetadata: CalculateMetadataFunction<EpisodeProps> = async ({ props }) => {
  const ep = EPISODES.find((e) => e.number === props.episode)!;
  const measured = await Promise.all(
    ep.scenes.map(async (s, i) => {
      try {
        const seconds = await getAudioDurationInSeconds(staticFile(audioPath(ep.number, i)));
        return { frames: Math.ceil(seconds * FPS), audio: true };
      } catch {
        return { frames: s.durationInFrames, audio: false };
      }
    }),
  );
  const durations = measured.map((m) => m.frames);
  return { durationInFrames: totalFrames(durations), props: { ...props, durations, audio: measured.map((m) => m.audio) } };
};

export const RemotionRoot: React.FC = () => (
  <>
    {EPISODES.map((ep) => {
      const durations = ep.scenes.map((s) => s.durationInFrames);
      return (
        <Composition
          key={ep.number}
          id={`Episode${String(ep.number).padStart(2, "0")}`}
          component={EpisodeVideo}
          durationInFrames={totalFrames(durations)}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          defaultProps={{ episode: ep.number, durations, audio: durations.map(() => false) }}
          calculateMetadata={calculateMetadata}
        />
      );
    })}
  </>
);
