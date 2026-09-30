// Timing rules shared by the Remotion compositions and scripts/export-voiceover.ts.
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const WORDS_PER_SECOND = 2.2;
export const GAP_FRAMES = FPS; // 1 s pause between consecutive scenes

export const countWords = (narration: string): number =>
  narration.trim().split(/\s+/).filter(Boolean).length;

export const estimateFrames = (narration: string): number =>
  Math.ceil((countWords(narration) / WORDS_PER_SECOND) * FPS);

export const audioPath = (episode: number, sceneIndex: number): string =>
  `audio/episode_${String(episode).padStart(2, "0")}/scene_${String(sceneIndex + 1).padStart(2, "0")}.mp3`;

// Start frame of each scene: scenes play back to back with GAP_FRAMES between them.
export const sceneStarts = (durations: number[]): number[] => {
  const starts: number[] = [];
  let t = 0;
  for (const d of durations) {
    starts.push(t);
    t += d + GAP_FRAMES;
  }
  return starts;
};

export const totalFrames = (durations: number[]): number =>
  durations.reduce((a, d) => a + d, 0) + GAP_FRAMES * Math.max(0, durations.length - 1);

// Builds a scene whose duration is estimated from its narration.
export const scene = (
  id: string,
  bar: string,
  narration: string,
  visuals: import("./types.ts").Visual[],
): import("./types.ts").Scene => ({ id, bar, narration, visuals, durationInFrames: estimateFrames(narration) });
