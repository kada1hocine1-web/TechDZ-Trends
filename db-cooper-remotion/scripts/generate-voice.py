#!/usr/bin/env python3
"""Generate the 12 French voice-over lines, measure them with ffprobe and write src/data/durations.json.

- ELEVENLABS_API_KEY set  -> ElevenLabs (multilingual model, character-level timestamps)
- otherwise               -> edge-tts, voice fr-FR-HenriNeural, rate -8%, pitch -4Hz (word boundaries)
- --no-voice              -> no audio: durations derived from the text at a subtitle reading speed
- --from-file narration.wav -> one recording of the whole script, split into the 12 lines on its pauses
"""
import asyncio, base64, json, math, os, re, subprocess, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "public" / "audio"
FPS, BREATH = 30, 12
READING_CPS = 16  # characters per second, used only with --no-voice

src = (ROOT / "src" / "data" / "script.ts").read_text(encoding="utf-8")
SCRIPT = [(m[0], m[1].replace("\\'", "'")) for m in re.findall(r"\{id: '(s\d\d)', text: '((?:[^'\\]|\\.)*)'\}", src)]
assert len(SCRIPT) == 12, "script.ts must contain 12 lines"


def words_from_chars(text, chars, starts, ends):
    """Group character timestamps into words."""
    words, cur, s = [], "", None
    for ch, a, b in zip(chars, starts, ends):
        if ch.isspace():
            if cur:
                words.append({"w": cur, "s": s, "e": prev_end})
            cur, s = "", None
            continue
        if s is None:
            s = a
        cur += ch
        prev_end = b
    if cur:
        words.append({"w": cur, "s": s, "e": prev_end})
    return words


def elevenlabs(text, out):
    voice = os.environ.get("ELEVENLABS_VOICE_ID", "onwK4e9ZLuTAKqWW03F9")  # deep male narrator
    body = json.dumps({
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.6, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True, "speed": 0.9},
    }).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
        data=body,
        headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"},
    )
    data = json.load(urllib.request.urlopen(req, timeout=120))
    out.write_bytes(base64.b64decode(data["audio_base64"]))
    al = data["alignment"]
    return words_from_chars(text, al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"])


async def edge(text, out):
    import edge_tts
    com = edge_tts.Communicate(text, "fr-FR-HenriNeural", rate="-8%", pitch="-4Hz", boundary="WordBoundary")
    words = []
    with open(out, "wb") as fh:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                fh.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                s = chunk["offset"] / 1e7
                words.append({"w": chunk["text"], "s": s, "e": s + chunk["duration"] / 1e7})
    return words


def attach_punctuation(text, words):
    """TTS word lists drop punctuation; re-map onto the script's own tokens so subtitles match the text."""
    tokens = text.split()
    if len(words) == len(tokens):
        return [{**w, "w": t} for w, t in zip(words, tokens)]
    return None


def proportional(text, seconds):
    tokens, total, acc, out = text.split(), len(text), 0.0, []
    for t in tokens:
        d = seconds * (len(t) + 1) / total
        out.append({"w": t, "s": acc, "e": acc + d})
        acc += d
    return out


def ffmpeg(*args):
    return subprocess.run(["npx", "--no-install", "remotion", "ffmpeg", "-hide_banner", *args], cwd=ROOT, capture_output=True, text=True)


def split_recording(src):
    """Split one full-script recording into 12 files at the pauses that best match each line's length.
    Returns, per line, the speech chunks (start, end) relative to the cut file."""
    log = ffmpeg("-i", str(src), "-af", "silencedetect=noise=-38dB:d=0.35", "-f", "null", "-").stderr
    vals = [float(v) for v in re.findall(r"silence_(?:start|end): ([0-9.]+)", log)]
    total = duration(src)
    sil = [(vals[i], vals[i + 1] if i + 1 < len(vals) else total) for i in range(0, len(vals), 2)]
    end = sil[-1][0] if sil and sil[-1][1] >= total - 0.05 else total
    cands = [x for x in sil if x[1] < total - 0.05]
    weights = [len(t) for _, t in SCRIPT]
    exp = [w / sum(weights) * end for w in weights]
    n, memo = len(cands), {}

    def best(k, j):  # lines placed so far, index of last boundary pause (-1 = start)
        if (k, j) in memo:
            return memo[(k, j)]
        s0 = 0.0 if j < 0 else cands[j][1]
        if k == len(SCRIPT) - 1:
            res = ((end - s0 - exp[k]) ** 2 / exp[k], ())
        else:
            res = (float("inf"), ())
            for nj in range(j + 1, n):
                d = cands[nj][0] - s0
                cost = (d - exp[k]) ** 2 / exp[k] - 2.0 * (cands[nj][1] - cands[nj][0])  # favour long pauses
                sub = best(k + 1, nj)
                if cost + sub[0] < res[0]:
                    res = (cost + sub[0], (nj,) + sub[1])
        memo[(k, j)] = res
        return res

    idx = best(0, -1)[1]
    assert len(idx) == len(SCRIPT) - 1, "not enough pauses to split the recording into 12 lines"
    bounds = [0.0] + [cands[i][1] for i in idx]
    ends = [cands[i][0] for i in idx] + [end]
    chunks = []
    for (sid, _), a, b in zip(SCRIPT, bounds, ends):
        a0, b0 = max(0.0, a - 0.08), min(total, b + 0.15)
        ffmpeg("-y", "-loglevel", "error", "-i", str(src), "-ss", f"{a0:.3f}", "-t", f"{b0 - a0:.3f}",
               "-ac", "2", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", str(AUDIO / f"{sid}.mp3"))
        inner = [x for x in sil if a < x[0] and x[1] < b]
        edges = [a] + [v for x in inner for v in x] + [b]
        chunks.append([(edges[i] - a0, edges[i + 1] - a0) for i in range(0, len(edges), 2)])
    return chunks


def words_over_chunks(text, chunks):
    """Spread words over the speech chunks (pauses excluded) in proportion to their length."""
    speech = sum(e - s for s, e in chunks)
    tokens, out, acc = text.split(), [], 0.0

    def at(t):
        for s, e in chunks:
            if t <= e - s:
                return s + t
            t -= e - s
        return chunks[-1][1]

    for tok in tokens:
        d = speech * (len(tok) + 1) / (len(text) + 1)
        out.append({"w": tok, "s": at(acc + 0.001), "e": at(acc + d)})
        acc += d
    return out


def duration(path):
    r = subprocess.run(
        ["npx", "--no-install", "remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        cwd=ROOT, capture_output=True, text=True, check=True,
    )
    return float(r.stdout.strip())


def main():
    AUDIO.mkdir(parents=True, exist_ok=True)
    no_voice = "--no-voice" in sys.argv
    recording = sys.argv[sys.argv.index("--from-file") + 1] if "--from-file" in sys.argv else None
    use_el = bool(os.environ.get("ELEVENLABS_API_KEY"))
    print("Moteur :", "aucun (sans voix off)" if no_voice else f"fichier {recording}" if recording else "ElevenLabs" if use_el else "edge-tts fr-FR-HenriNeural")
    chunks = split_recording(Path(recording)) if recording else None
    scenes = []
    for i, (sid, text) in enumerate(SCRIPT):
        if chunks:
            out = AUDIO / f"{sid}.mp3"
            secs = duration(out)
            words = words_over_chunks(text, chunks[i])
        elif no_voice:
            out, secs = None, round(len(text) / READING_CPS, 3)
            words = proportional(text, secs)
        else:
            out = AUDIO / f"{sid}.mp3"
            raw = elevenlabs(text, out) if use_el else asyncio.run(edge(text, out))
            secs = duration(out)
            words = attach_punctuation(text, raw) or proportional(text, secs)
        words = [{"w": w["w"], "s": round(w["s"], 3), "e": round(w["e"], 3)} for w in words]
        frames = math.ceil(secs * FPS) + BREATH
        scenes.append({"id": sid, "file": out.name if out else None, "seconds": round(secs, 3), "frames": frames, "words": words})
    (ROOT / "src" / "data" / "durations.json").write_text(
        json.dumps({"voice": not no_voice, "fps": FPS, "breathFrames": BREATH, "scenes": scenes}, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    total = sum(s["frames"] for s in scenes)
    print(f"{'Scène':<6} {'Durée (s)':>10} {'Frames':>7}")
    for s in scenes:
        print(f"{s['id']:<6} {s['seconds']:>10.3f} {s['frames']:>7}")
    print(f"{'TOTAL':<6} {total / FPS:>10.3f} {total:>7}  (+ {2 * FPS} frames d'image figée)")


if __name__ == "__main__":
    sys.exit(main())
