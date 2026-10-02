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

## Real photos (Wikimedia Commons)

`data/photos.py` lists, per case and scene, a Commons search query. `python3 scripts/fetch-photos.py [slug]`
downloads the first freely licensed match (public domain, CC0, CC BY, CC BY-SA; anything else is skipped),
saves it to `public/photos/<slug>/sNN.jpg` and records it in `src/photos.json`. Scenes with a photo show it as a
torn print with the credit on screen; run `python3 scripts/export-cases.py` again to add the credits to `DESCRIPTIONS.md`.
Needs network access to commons.wikimedia.org and upload.wikimedia.org.

## Local AI voice (Kokoro, no online service)

```bash
python3 -m venv .tts/venv && .tts/venv/bin/pip install kokoro-onnx soundfile
curl -L -o .tts/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -L -o .tts/voices-v1.0.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
.tts/venv/bin/python scripts/generate-voice.py --case jack-the-ripper --kokoro am_michael
npx remotion render jack-the-ripper out/jack-the-ripper.mp4 --codec=h264
```

Kokoro-82M (Apache-2.0) runs on CPU. Male English voices: am_adam, am_echo, am_eric, am_fenrir, am_liam,
am_michael, am_onyx, am_puck, bm_daniel, bm_fable, bm_george, bm_lewis. Each line is synthesized separately
and loudness-normalised to -16 LUFS.
