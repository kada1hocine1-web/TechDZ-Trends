import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { EPISODES } from "./episodes/index.ts";
import { Scene } from "./Scene.tsx";
import { BOARD_BACKGROUND, fontFamily } from "./theme.ts";
import { GAP_FRAMES, audioPath, sceneStarts } from "./timing.ts";

export type EpisodeProps = { episode: number; durations: number[]; audio: boolean[] };

// Scenes play back to back; during the 1 s gap the previous scene stays on the board.
export const EpisodeVideo: React.FC<EpisodeProps> = ({ episode, durations, audio }) => {
  const ep = EPISODES.find((e) => e.number === episode)!;
  const starts = sceneStarts(durations);
  return (
    <AbsoluteFill style={{ background: BOARD_BACKGROUND, fontFamily, direction: "rtl" }}>
      {ep.scenes.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={durations[i] + (i < ep.scenes.length - 1 ? GAP_FRAMES : 0)} name={`${String(i + 1).padStart(2, "0")} ${s.id}`}>
          <Scene scene={s} episode={episode} narrationFrames={durations[i]} />
          {audio[i] ? <Audio src={staticFile(audioPath(episode, i))} /> : null}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
