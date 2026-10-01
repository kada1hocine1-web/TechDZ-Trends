// Render one still per scene (at 80% of the scene) for QA: node scripts/stills.mjs <slug> [scene numbers...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [slug, ...only] = process.argv.slice(2);
const root = path.resolve(import.meta.dirname, '..');
const timings = JSON.parse(fs.readFileSync(path.join(root, 'src/timings', `${slug}.json`), 'utf8'));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const composition = await selectComposition({serveUrl, id: slug, browserExecutable});
let start = 0;
for (const [i, s] of timings.scenes.entries()) {
  const n = i + 1;
  if (!only.length || only.includes(String(n))) {
    const output = path.join(root, 'out', `qa-${slug}-${String(n).padStart(2, '0')}.png`);
    await renderStill({serveUrl, composition, frame: start + Math.floor(s.frames * 0.8), output, scale: 0.4, browserExecutable});
    console.log(output);
  }
  start += s.frames;
}
