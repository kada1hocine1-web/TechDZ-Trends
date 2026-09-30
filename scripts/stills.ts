// Renders 3 stills per episode into out/stills/ (end of the scenes at ~25 %, 50 % and 75 % of the episode,
// when every visual of the scene is written). Optional: CHROME=/path/to/browser node scripts/stills.ts [episode]
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { EPISODES } from "../src/episodes/index.ts";
import { sceneStarts } from "../src/timing.ts";

mkdirSync("out/stills", { recursive: true });
const only = process.argv[2] ? Number(process.argv[2]) : null;
for (const ep of EPISODES.filter((e) => only === null || e.number === only)) {
  const durations = ep.scenes.map((s) => s.durationInFrames);
  const starts = sceneStarts(durations);
  const nn = String(ep.number).padStart(2, "0");
  [0.25, 0.5, 0.75].forEach((f, k) => {
    const i = Math.min(ep.scenes.length - 1, Math.floor(ep.scenes.length * f));
    const frame = starts[i] + durations[i] - 1;
    const out = `out/stills/episode_${nn}_${k + 1}_${ep.scenes[i].id}.png`;
    const args = ["remotion", "still", `Episode${nn}`, out, `--frame=${frame}`, ...(process.env.CHROME ? [`--browser-executable=${process.env.CHROME}`] : [])];
    execFileSync("npx", args, { stdio: "inherit" });
  });
}
