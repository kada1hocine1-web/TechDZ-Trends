# True-crime shorts (EN, 9:16)

20 vertical TikTok videos in the torn-paper style, generated from data.

- `data/cases.py` — source of truth: one entry per case, each line = one scene (`text` = voice-over, `v` = visual block).
- `python3 scripts/export-cases.py` — writes `src/cases/*.json`, `src/registry.ts`, `voiceover/*.txt` (texts to record) and `DESCRIPTIONS.md` (captions).
- `python3 scripts/generate-voice.py --case <slug> --from-file recording.wav [--cuts end:start,...]` — splits a full recording into lines and measures timings (`--no-voice` = provisional timings from reading speed).
- `npx remotion render <slug> out/<slug>.mp4 --codec=h264` — renders one case (composition id = slug).
- `scripts/process.sh <slug> <recording.wav>` — all of the above for one case, plus a <30 MB preview.
- `node scripts/stills.mjs <slug> [scenes...]` — QA stills, one per scene.

## Adding your own voice-over

The rendered videos (`out/<slug>.mp4`) are timed for a typical TTS pace (~15 characters/second, pauses included),
with subtitles, music bed and transitions but no voice. Two ways to add your recordings:

### A. In a video editor (no setup)
Open `TIMECODES.md`: for each video it lists when every line starts and how long its slot is.
Place each recorded line at its start time. If your line is a bit longer or shorter than its slot, that's fine;
the subtitles follow the planned timing, so keep lines close to their slot.

### B. Automatic re-sync (recommended, exact sync)
Requirements: Node.js 18+, Python 3. Then, in `true-crime-en/`:

```bash
npm install
# one recording of the whole script per case (lines in order, ~1 s pause between lines):
scripts/process.sh jack-the-ripper ~/voices/01-jack-the-ripper.wav
```

This splits your recording into lines on its pauses, retimes every scene and subtitle to your voice,
and renders `out/<slug>.mp4` (+ `out/<slug>-preview.mp4`). If two lines were read without a pause,
force the boundaries with `--cuts end:start,...` (seconds, one pair per boundary).
Remotion downloads its own headless browser on first run.
