#!/usr/bin/env bash
# Meme sound effects, synthesised locally (Python stdlib) and encoded to MP3 with Remotion's ffmpeg:
# boom, whoosh, pop, gun (machine-gun burst), clank (jam), sad (sad trombone), fanfare (victory).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/sfx
for name in boom whoosh pop gun clank sad fanfare; do
python3 - "$name" <<'PY' | npx --no-install remotion ffmpeg -hide_banner -loglevel error -y -f s16le -ar 44100 -ac 1 -i - -ac 2 -c:a libmp3lame -b:a 192k "public/sfx/$name.mp3"
import array, math, random, sys
sr = 44100
name = sys.argv[1]
random.seed(name)
out = []

def env(t, a, d):
    return min(1, t / a) * math.exp(-t / d)

def tone(freq_fn, dur, shape=lambda p: math.sin(p), amp=1.0, a=0.005, d=0.3, start=0.0):
    n0 = int(start * sr)
    while len(out) < n0 + int(dur * sr):
        out.append(0.0)
    ph = 0.0
    for i in range(int(dur * sr)):
        t = i / sr
        ph += 2 * math.pi * freq_fn(t) / sr
        out[n0 + i] += amp * env(t, a, d) * shape(ph)

def noise(dur, amp, a, d, start=0.0, lp=0.3):
    n0 = int(start * sr)
    while len(out) < n0 + int(dur * sr):
        out.append(0.0)
    y = 0.0
    for i in range(int(dur * sr)):
        t = i / sr
        y += lp * (random.uniform(-1, 1) - y)
        out[n0 + i] += amp * env(t, a, d) * y

square = lambda p: 1.0 if math.sin(p) >= 0 else -1.0
saw = lambda p: ((p / math.pi) % 2) - 1

if name == 'boom':
    tone(lambda t: 38 + 70 * math.exp(-t * 12), 1.4, amp=1.0, a=0.003, d=0.5)
    noise(0.15, 0.5, 0.001, 0.03)
elif name == 'whoosh':
    n = int(0.45 * sr); y = 0.0
    for i in range(n):
        t = i / sr
        k = 0.05 + 0.5 * math.sin(math.pi * t / 0.45)
        y += k * (random.uniform(-1, 1) - y)
        out.append(y * math.sin(math.pi * t / 0.45))
elif name == 'pop':
    tone(lambda t: 900 * math.exp(-t * 30) + 200, 0.12, amp=0.9, a=0.001, d=0.04)
elif name == 'gun':
    for k in range(14):
        noise(0.09, 1.0, 0.001, 0.025, start=k * 0.085, lp=0.6)
        tone(lambda t: 90, 0.09, amp=0.6, a=0.001, d=0.03, start=k * 0.085)
elif name == 'clank':
    for f0 in (523, 1187, 1790):
        tone(lambda t, f0=f0: f0, 0.6, amp=0.5, a=0.001, d=0.12)
    noise(0.05, 0.6, 0.001, 0.02)
elif name == 'sad':
    notes = [(311, 0.45), (294, 0.45), (277, 0.45), (262, 1.3)]
    s = 0.0
    for f0, d in notes:
        tone(lambda t, f0=f0, d=d: f0 * (1 + (0.03 * math.sin(2 * math.pi * 6 * t) if d > 1 else 0)), d, shape=saw, amp=0.35, a=0.03, d=d * 0.9, start=s)
        s += d
elif name == 'fanfare':
    notes = [(523, 0.14), (523, 0.14), (523, 0.14), (659, 0.5), (523, 0.2), (784, 0.9)]
    s = 0.0
    for f0, d in notes:
        tone(lambda t, f0=f0: f0, d, shape=square, amp=0.22, a=0.01, d=d * 1.2, start=s)
        tone(lambda t, f0=f0: f0 / 2, d, shape=saw, amp=0.15, a=0.01, d=d * 1.2, start=s)
        s += d

peak = max(abs(x) for x in out) or 1
g = 10 ** (-1.5 / 20) / peak
sys.stdout.buffer.write(array.array('h', (int(x * g * 32767) for x in out)).tobytes())
PY
done
echo "SFX OK: $(ls public/sfx | tr '\n' ' ')"
