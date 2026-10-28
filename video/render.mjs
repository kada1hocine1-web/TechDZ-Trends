// Rendu : node render.mjs <Composition> <sortie.mp4> [frames début-fin]
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [, , id = "Apercu", out = "out/apercu.mp4", range] = process.argv;
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const chromiumOptions = { gl: "angle", enableMultiProcessOnLinux: true };

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions });

if (out.endsWith(".png")) {
  // vignettes : out = dossier/prefixe.png, range = liste de frames séparées par des virgules
  for (const fr of (range ?? "0").split(",").map(Number)) {
    await renderStill({ serveUrl, composition, frame: fr, output: out.replace(/\.png$/, `_${fr}.png`), browserExecutable, chromiumOptions });
  }
} else {
  let last = -1;
  await renderMedia({
    serveUrl, composition, codec: "h264", outputLocation: out, browserExecutable, chromiumOptions,
    crf: 18, pixelFormat: "yuv420p", audioCodec: "aac", audioBitrate: "192k",
    frameRange: range ? range.split("-").map(Number) : undefined,
    concurrency: Number(process.env.CONCURRENCY ?? 3),
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 20);
      if (p !== last) { last = p; console.log(`${Math.round(progress * 100)} %`); }
    },
  });
}
console.log("terminé :", out);
