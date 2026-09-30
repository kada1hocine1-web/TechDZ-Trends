// Generates voiceover/episode_NN_voiceover.txt (UTF-8) from src/episodes/*.ts, the single source of truth.
// Scene timings use the same rules as the video (src/timing.ts): the audio length when
// public/audio/episode_NN/scene_XX.mp3 exists (read with `npx remotion ffprobe`), otherwise the estimate.
// Also writes voiceover/tts/episode_NN/scene_XX.txt: the narration of each scene alone, ready for a TTS
// engine; the generated audio goes to public/audio/episode_NN/scene_XX.mp3 (same NN/XX).
// Run: node scripts/export-voiceover.ts
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { EPISODES } from "../src/episodes/index.ts";
import { FPS, audioPath, sceneStarts, totalFrames } from "../src/timing.ts";

// Narration must be speakable text only: no digits, Latin letters, or math/chemistry symbols.
const FORBIDDEN = /[0-9A-Za-z٠-٩⁰-₟+=×÷/\\^_$%()[\]{}<>→←·°]/;

const audioSeconds = (file: string): number => {
  const out = execFileSync("npx", ["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], {
    encoding: "utf8",
  });
  return parseFloat(out.trim());
};

const clock = (frames: number): string => {
  const s = frames / FPS;
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${(s - m * 60).toFixed(1).padStart(4, "0")}`;
};

mkdirSync("voiceover", { recursive: true });
let failed = false;
for (const ep of EPISODES) {
  const durations = ep.scenes.map((s, i) => {
    const file = `public/${audioPath(ep.number, i)}`;
    return existsSync(file) ? Math.ceil(audioSeconds(file) * FPS) : s.durationInFrames;
  });
  const starts = sceneStarts(durations);
  const blocks = ep.scenes.map((s, i) => {
    const bad = s.narration.match(FORBIDDEN);
    if (bad) {
      failed = true;
      console.error(`episode ${ep.number} scene ${s.id}: forbidden character "${bad[0]}" in narration`);
    }
    const head = `[المشهد ${String(i + 1).padStart(2, "0")}] ${s.id} | ${clock(starts[i])} → ${clock(starts[i] + durations[i])} | ${(durations[i] / FPS).toFixed(1)} s`;
    return `${head}\n${s.narration}\n`;
  });
  const nn = String(ep.number).padStart(2, "0");
  writeFileSync(`voiceover/episode_${nn}_voiceover.txt`, blocks.join("\n"), "utf8");
  mkdirSync(`voiceover/tts/episode_${nn}`, { recursive: true });
  ep.scenes.forEach((s, i) => writeFileSync(`voiceover/tts/episode_${nn}/scene_${String(i + 1).padStart(2, "0")}.txt`, `${s.narration}\n`, "utf8"));
  const total = totalFrames(durations) / FPS;
  const ok = total >= 570 && total <= 630;
  if (!ok) failed = true;
  console.log(`${ok ? "OK " : "BAD"} episode ${nn}: ${ep.scenes.length} scenes, ${total.toFixed(1)} s`);
}
process.exit(failed ? 1 : 0);
