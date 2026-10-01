#!/usr/bin/env bash
# One case end-to-end: split the recording, render the 9:16 video, check it, make a <30 MB preview.
#   scripts/process.sh <slug> <recording.wav> [--cuts end:start,...]
set -euo pipefail
cd "$(dirname "$0")/.."
# Video bitrate that keeps the preview under ~28 MB whatever the duration (192 kbps kept for audio).
preview_kbps() { local d; d=$(npx --no-install remotion ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"); awk -v d="$d" 'BEGIN { k = int(28 * 8192 / d - 200); print (k > 3000 ? 3000 : k) }'; }
slug=$1; wav=$2; shift 2
python3 scripts/generate-voice.py --case "$slug" --from-file "$wav" "$@"
npx remotion render "$slug" "out/$slug.mp4" --codec=h264 --log=error
npx --no-install remotion ffprobe -v error -show_entries stream=codec_type,width,height,nb_frames:format=duration -of default=nw=1 "out/$slug.mp4" | tr '\n' ' '; echo
npx --no-install remotion ffmpeg -hide_banner -loglevel error -y -i "out/$slug.mp4" -c:v libx264 -b:v "$(preview_kbps "out/$slug.mp4")k" -maxrate "$(preview_kbps "out/$slug.mp4")k" -bufsize 6000k -c:a copy "out/$slug-preview.mp4"
ls -la "out/$slug.mp4" "out/$slug-preview.mp4"
