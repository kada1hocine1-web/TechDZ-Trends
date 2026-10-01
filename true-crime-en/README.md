# True-crime shorts (EN, 9:16)

20 vertical TikTok videos in the torn-paper style, generated from data.

- `data/cases.py` — source of truth: one entry per case, each line = one scene (`text` = voice-over, `v` = visual block).
- `python3 scripts/export-cases.py` — writes `src/cases/*.json`, `src/registry.ts`, `voiceover/*.txt` (texts to record) and `DESCRIPTIONS.md` (captions).
- `python3 scripts/generate-voice.py --case <slug> --from-file recording.wav [--cuts end:start,...]` — splits a full recording into lines and measures timings (`--no-voice` = provisional timings from reading speed).
- `npx remotion render <slug> out/<slug>.mp4 --codec=h264` — renders one case (composition id = slug).
