#!/usr/bin/env python3
"""Generate the 12 French voice-over lines, measure them with ffprobe and write src/data/durations.json.

- ELEVENLABS_API_KEY set  -> ElevenLabs (multilingual model, character-level timestamps)
- otherwise               -> edge-tts, voice fr-FR-HenriNeural, rate -8%, pitch -4Hz (word boundaries)
"""
import asyncio, base64, json, math, os, re, subprocess, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "public" / "audio"
FPS, BREATH = 30, 12

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


def duration(path):
    r = subprocess.run(
        ["npx", "--no-install", "remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        cwd=ROOT, capture_output=True, text=True, check=True,
    )
    return float(r.stdout.strip())


def main():
    AUDIO.mkdir(parents=True, exist_ok=True)
    use_el = bool(os.environ.get("ELEVENLABS_API_KEY"))
    print("Moteur :", "ElevenLabs" if use_el else "edge-tts fr-FR-HenriNeural")
    scenes = []
    for sid, text in SCRIPT:
        out = AUDIO / f"{sid}.mp3"
        raw = elevenlabs(text, out) if use_el else asyncio.run(edge(text, out))
        secs = duration(out)
        words = attach_punctuation(text, raw) or proportional(text, secs)
        words = [{"w": w["w"], "s": round(w["s"], 3), "e": round(w["e"], 3)} for w in words]
        frames = math.ceil(secs * FPS) + BREATH
        scenes.append({"id": sid, "file": out.name, "seconds": round(secs, 3), "frames": frames, "words": words})
    (ROOT / "src" / "data" / "durations.json").write_text(
        json.dumps({"fps": FPS, "breathFrames": BREATH, "scenes": scenes}, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    total = sum(s["frames"] for s in scenes)
    print(f"{'Scène':<6} {'Durée (s)':>10} {'Frames':>7}")
    for s in scenes:
        print(f"{s['id']:<6} {s['seconds']:>10.3f} {s['frames']:>7}")
    print(f"{'TOTAL':<6} {total / FPS:>10.3f} {total:>7}  (+ {2 * FPS} frames d'image figée)")


if __name__ == "__main__":
    sys.exit(main())
