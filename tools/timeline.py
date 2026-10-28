"""Cale chaque scène sur la durée réelle de son audio, puis écrit la timeline et le SRT.

Usage : python tools/timeline.py
Entrées : audio/voix/sceneNN.{mp3,json}
Sorties : assets/data/timeline.json, out/cristallogenese_silicium.srt
"""
import difflib, json, math, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(__file__))
from tts import speakable  # noqa: E402

FPS = 30
HEAD = 0.6            # silence avant la voix, en secondes
TAIL = 1.0            # respiration après la voix
FIRST_HEAD = 1.2      # carton d'ouverture
CREDITS_HOLD = 20.0   # durée totale de la scène de générique
MAX_CUE = 80          # 2 lignes d'environ 40 caractères
MAX_LINE = 42

PRETTY = [
    (r"dix puissance vingt-deux", "10²²"), (r"dix puissance dix-neuf", "10¹⁹"),
    (r"dix puissance dix-huit", "10¹⁸"), (r"dix puissance dix-sept", "10¹⁷"),
    (r"dix puissance seize", "10¹⁶"), (r"dix puissance quinze", "10¹⁵"),
    (r"dix puissance douze", "10¹²"), (r"\bs p trois\b", "sp³"),
    (r"\bC O P\b", "COP"), (r"\bM C Z\b", "MCZ"), (r"\bF Z\b", "FZ"), (r"\bA E G\b", "AEG"),
    (r"plans un un un", "plans {111}"), (r"l'axe un zéro zéro", "l'axe [100]"),
    (r"\bksi t\b", "ξₜ"), (r"\bC s\b", "Cₛ"), (r"\bC l\b", "Cₗ"), (r"\bC zéro\b", "C₀"),
    (r"\bk zéro\b", "k₀"), (r"\bd C l\b", "dCₗ"), (r"\bd g\b", "dg"),
    (r"\bV rho L égale K d T sur d x\b", "V·ρ·L = K·dT/dx"), (r"\bd T sur d x\b", "dT/dx"),
    (r"\brho L V\b", "ρLV"), (r"\bv delta sur D\b", "vδ/D"), (r"\bv sur G\b", "v/G"),
    (r"\bG sur v\b", "G/v"), (r"\bsigma u B carré\b", "σuB²"), (r"\bmu u sur L carré\b", "μu/L²"),
    (r"\bdelta\b", "δ"), (r"\bepsilon\b", "ε"), (r"\bthêta\b", "θ"),
]


def pretty(s):
    for a, b in PRETTY:
        s = re.sub(a, b, s)
    return s


def norm(s):
    return "".join(c for c in s.lower() if c.isalnum())


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", path], capture_output=True, text=True, check=True)
    return float(out.stdout)


def char_times(spoken, words):
    """Associe à chaque caractère normalisé du texte prononcé un instant (s)."""
    stream = norm(spoken)
    wchars, wtimes = [], []
    for w in words:
        n = norm(w["w"])
        for i, c in enumerate(n):
            wchars.append(c)
            wtimes.append((w["t"] + w["d"] * i / max(len(n), 1), w["t"] + w["d"]))
    times = [None] * len(stream)
    sm = difflib.SequenceMatcher(None, stream, "".join(wchars), autojunk=False)
    for a, b, size in sm.get_matching_blocks():
        for k in range(size):
            times[a + k] = wtimes[b + k]
    # combler les trous par interpolation sur les voisins connus
    known = [i for i, t in enumerate(times) if t]
    for i in range(len(times)):
        if times[i] is None:
            prev = max((k for k in known if k < i), default=None)
            nxt = min((k for k in known if k > i), default=None)
            if prev is None:
                times[i] = times[nxt]
            elif nxt is None:
                times[i] = times[prev]
            else:
                f = (i - prev) / (nxt - prev)
                s = times[prev][0] + f * (times[nxt][0] - times[prev][0])
                times[i] = (s, max(s, times[prev][1]))
    return times


def split_cues(text):
    """Découpe en phrases puis en segments d'au plus MAX_CUE caractères (affichage)."""
    cues = []
    for sent in re.split(r"(?<=[.?!])\s+", text.strip()):
        while len(pretty(sent)) > MAX_CUE:
            words = sent.split()
            # meilleur point de coupure : ponctuation proche du milieu, sinon espace
            best, score = None, None
            for i in range(1, len(words)):
                left = " ".join(words[:i])
                if len(pretty(left)) > MAX_CUE:
                    break
                if len(pretty(" ".join(words[i:]))) < 12:
                    continue
                bonus = 0 if left[-1] in ",;:" else 25
                sc = abs(len(left) - len(sent) / 2) + bonus
                if score is None or sc < score:
                    best, score = i, sc
            if best is None:
                best = max(1, len(words) // 2)
            cues.append(" ".join(words[:best]))
            sent = " ".join(words[best:])
        cues.append(sent)
    return cues


def wrap(s):
    if len(s) <= MAX_LINE:
        return s
    words, best = s.split(), None
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        cost = max(len(a), len(b))
        if best is None or cost < best[0]:
            best = (cost, a + "\n" + b)
    return best[1]


def ts(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    vdir = os.path.join(root, "audio", "voix")
    ids = sorted(f[5:7] for f in os.listdir(vdir) if re.fullmatch(r"scene\d\d\.json", f))
    t0, scenes, cues = 0.0, [], []
    for sid in ids:
        meta = json.load(open(os.path.join(vdir, f"scene{sid}.json"), encoding="utf-8"))
        audio = duration(os.path.join(vdir, f"scene{sid}.mp3"))
        head = FIRST_HEAD if sid == ids[0] else HEAD
        dur = head + audio + TAIL
        if sid == ids[-1]:
            dur = max(dur, CREDITS_HOLD)
        frames = math.ceil(dur * FPS)
        start = t0 + head
        times = char_times(meta["spoken"], meta["words"])
        pos, words_abs = 0, []
        for c in split_cues(meta["text"]):
            n = len(norm(speakable(c)))
            if n == 0:
                continue
            a, b = times[pos], times[min(pos + n, len(times)) - 1]
            pos += n
            cues.append((start + a[0], start + b[1], pretty(c)))
        for w in meta["words"]:
            words_abs.append({"t": round(start + w["t"], 3), "d": round(w["d"], 3), "w": w["w"]})
        scenes.append({"id": sid, "from": round(t0 * FPS), "frames": frames,
                       "audio": f"voix/scene{sid}.mp3", "audioOffsetFrames": round(head * FPS),
                       "audioSeconds": round(audio, 3), "words": words_abs})
        t0 += frames / FPS
    # fermer les micro-trous entre sous-titres consécutifs, sans chevauchement
    srt = []
    for i, (a, b, s) in enumerate(cues):
        if i + 1 < len(cues) and 0 < cues[i + 1][0] - b < 0.4:
            b = cues[i + 1][0] - 0.001
        srt.append(f"{i + 1}\n{ts(a)} --> {ts(b)}\n{wrap(s)}\n")
    os.makedirs(os.path.join(root, "out"), exist_ok=True)
    open(os.path.join(root, "out", "cristallogenese_silicium.srt"), "w", encoding="utf-8").write("\n".join(srt))
    json.dump({"fps": FPS, "totalFrames": round(t0 * FPS), "scenes": scenes},
              open(os.path.join(root, "assets", "data", "timeline.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"durée totale {t0:.1f} s = {t0 / 60:.2f} min ; {len(cues)} sous-titres")


if __name__ == "__main__":
    main()
