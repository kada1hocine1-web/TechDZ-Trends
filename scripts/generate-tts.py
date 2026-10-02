"""Generate public/audio/episode_NN/scene_XX.mp3 from voiceover/tts/episode_NN/scene_XX.txt with edge-tts.

Usage: python scripts/generate-tts.py [voice] [episodes e.g. 01,02] [rate e.g. +25%] [force]
Requires: pip install edge-tts (network access to speech.platform.bing.com).
"""
import asyncio, os, pathlib, sys, edge_tts
VOICE = sys.argv[1] if len(sys.argv) > 1 else "ar-DZ-IsmaelNeural"
EPS = sys.argv[2].split(",") if len(sys.argv) > 2 else None
RATE = sys.argv[3] if len(sys.argv) > 3 else "+0%"
FORCE = len(sys.argv) > 4 and sys.argv[4] == "force"
root = pathlib.Path(__file__).resolve().parent.parent
async def main():
    for txt in sorted((root / "voiceover/tts").glob("episode_*/scene_*.txt")):
        ep = txt.parent.name
        if EPS and ep.split("_")[1] not in EPS: continue
        out = root / "public/audio" / ep / (txt.stem + ".mp3")
        out.parent.mkdir(parents=True, exist_ok=True)
        if out.exists() and out.stat().st_size > 0 and not FORCE: continue
        await edge_tts.Communicate(txt.read_text(encoding="utf-8").strip(), VOICE, rate=RATE, proxy=os.environ.get("HTTPS_PROXY")).save(str(out))
        print("ok", out.relative_to(root))
asyncio.run(main())
