#!/usr/bin/env bash
# One case end-to-end: split the recording, render the 9:16 video, check it, make a <30 MB preview.
#   scripts/process.sh <slug> <recording.wav> [--cuts end:start,...]
set -euo pipefail
cd "$(dirname "$0")/.."
slug=$1; wav=$2; shift 2
python3 scripts/generate-voice.py --case "$slug" --from-file "$wav" "$@"
npx remotion render "$slug" "out/$slug.mp4" --codec=h264 --log=error
npx --no-install remotion ffprobe -v error -show_entries stream=codec_type,width,height,nb_frames:format=duration -of default=nw=1 "out/$slug.mp4" | tr '\n' ' '; echo
npx --no-install remotion ffmpeg -hide_banner -loglevel error -y -i "out/$slug.mp4" -c:v libx264 -b:v 3000k -maxrate 3300k -bufsize 6000k -c:a copy "out/$slug-preview.mp4"
ls -la "out/$slug.mp4" "out/$slug-preview.mp4"
