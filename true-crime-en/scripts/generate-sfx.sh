#!/usr/bin/env bash
# Locally synthesised sound design (nothing downloaded):
#  - drone.mp3 : dark low-frequency drone (placed at -24 dB under the voice in Video.tsx)
#  - tear.mp3  : 0.3 s filtered white noise "paper tear" played on every transition
# The ffmpeg bundled with Remotion has no audio synthesis filters, so samples are computed
# in Python (stdlib only) and piped to ffmpeg as raw PCM for MP3 encoding.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/audio
encode() { npx --no-install remotion ffmpeg -hide_banner -loglevel error -y -f s16le -ar 48000 -ac 1 -i - -ac 2 -c:a libmp3lame -b:a 192k "$1"; }

python3 - drone <<'PY' | encode public/audio/drone.mp3
import array, math, random, sys
sr, dur = 48000, 150
random.seed(1971)
out = array.array('h')
brown = lp = 0.0
buf = []
for i in range(sr * dur):
    t = i / sr
    s = (0.9 * math.sin(2 * math.pi * 41.2 * t)
         + 0.7 * math.sin(2 * math.pi * 55 * t) * (0.75 + 0.25 * math.sin(2 * math.pi * 0.13 * t))
         + 0.25 * math.sin(2 * math.pi * 82.4 * t) * (0.5 + 0.5 * math.sin(2 * math.pi * 0.07 * t)))
    brown = max(-1, min(1, brown + random.uniform(-0.02, 0.02)))
    lp += 0.02 * (brown - lp)
    s += 1.2 * lp
    s *= min(1, t / 3)
    buf.append(s)
peak = max(abs(x) for x in buf)
g = 10 ** (-1.5 / 20) / peak
out.extend(int(x * g * 32767) for x in buf)
sys.stdout.buffer.write(out.tobytes())
PY

python3 - tear <<'PY' | encode public/audio/tear.mp3
import array, math, random, sys
sr = 48000
n = int(sr * 0.3)
random.seed(305)
out = array.array('h')
hp_prev = hp = lp = 0.0
buf = []
crackle = 1.0
for i in range(n):
    t = i / sr
    x = random.uniform(-1, 1)
    hp = 0.9 * (hp + x - hp_prev); hp_prev = x   # high-pass ~ 800 Hz
    lp += 0.55 * (hp - lp)                      # low-pass ~ 7 kHz
    if i % int(sr / 38) == 0:
        crackle = random.uniform(0.25, 1.0)     # fibres ripping
    env = min(1, t / 0.015) * (1 if t < 0.08 else max(0.0, 1 - (t - 0.08) / 0.22))
    buf.append(lp * crackle * env)
peak = max(abs(x) for x in buf)
g = 10 ** (-1 / 20) / peak
out.extend(int(x * g * 32767) for x in buf)
sys.stdout.buffer.write(out.tobytes())
PY

# Channel outro: mouse click and notification bell.
python3 - <<'PY' | encode public/audio/click.mp3
import array, math, random, sys
sr = 48000
random.seed(7)
n = int(sr * 0.08)
out = array.array('h', (int(9000 * math.exp(-i / sr / 0.006) * random.uniform(-1, 1)) for i in range(n)))
sys.stdout.buffer.write(out.tobytes())
PY

python3 - <<'PY' | encode public/audio/bell.mp3
import array, math, sys
sr = 48000
n = int(sr * 1.6)
buf = []
for i in range(n):
    t = i / sr
    s = sum(a * math.sin(2 * math.pi * f * t) for f, a in ((1318, 1.0), (2637, 0.5), (3951, 0.25)))
    buf.append(s * math.exp(-t / 0.45) * min(1, t / 0.003))
peak = max(abs(x) for x in buf)
out = array.array('h', (int(x / peak * 0.8 * 32767) for x in buf))
sys.stdout.buffer.write(out.tobytes())
PY

echo "SFX OK: drone, tear, click, bell (public/audio)"
