"""Génère la voix off scène par scène avec edge-tts et enregistre les frontières de mots."""
import asyncio, json, re, sys, os
import ssl
import edge_tts
import edge_tts.communicate

# Faire confiance au CA du proxy sortant s'il est défini (vérification TLS conservée).
if os.environ.get("SSL_CERT_FILE"):
    edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile=os.environ["SSL_CERT_FILE"])

VOICE = os.environ.get("TTS_VOICE", "fr-FR-HenriNeural")
RATE = os.environ.get("TTS_RATE", "+0%")

# Formes écrites -> formes prononçables
SUBS = [
    (r"\bCz\b", "C Z"), (r"\bM C Z\b", "M.C.Z."), (r"\bF Z\b", "F.Z."),
    (r"\bC O P\b", "C.O.P."), (r"\bA E G\b", "A.E.G."), (r"\bs p trois\b", "S.P. trois"),
    (r"ksi t\b", "ksi té"), (r"\bC s\b", "C.S."), (r"\bC l\b", "C.L."), (r"\bd g\b", "D.G."),
    (r"\bd T sur d x\b", "D.T. sur D.X."), (r"\bk C l d g\b", "k, C.L., D.G."),
]

def scenes(md):
    parts = re.split(r"^## Scène (\d+)[^\n]*$", open(md, encoding="utf-8").read(), flags=re.M)
    for i in range(1, len(parts), 2):
        vo = " ".join(l[2:].strip() for l in parts[i + 1].splitlines() if l.startswith("> "))
        yield parts[i], vo

def speakable(text):
    for a, b in SUBS:
        text = re.sub(a, b, text)
    return text

async def synth(sid, text, outdir):
    com = edge_tts.Communicate(speakable(text), VOICE, rate=RATE, boundary="WordBoundary")
    words = []
    with open(f"{outdir}/scene{sid}.mp3", "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "w": ch["text"]})
    json.dump({"scene": sid, "text": text, "spoken": speakable(text), "words": words},
              open(f"{outdir}/scene{sid}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

async def main(md, outdir, only):
    os.makedirs(outdir, exist_ok=True)
    for sid, vo in scenes(md):
        if only and sid not in only:
            continue
        for attempt in range(4):
            try:
                await synth(sid, vo, outdir); break
            except Exception as e:
                print("retry", sid, e); await asyncio.sleep(2 ** attempt)
        print("ok", sid)

if __name__ == "__main__":
    asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3:]))
