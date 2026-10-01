#!/usr/bin/env bash
# Render every case (9:16) with its current timings, plus a <30 MB preview of each.
# Already-rendered cases are skipped; pass slugs to render only those.
set -uo pipefail
cd "$(dirname "$0")/.."
# Video bitrate that keeps the preview under ~28 MB whatever the duration (192 kbps kept for audio).
preview_kbps() { local d; d=$(npx --no-install remotion ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"); awk -v d="$d" 'BEGIN { k = int(28 * 8192 / d - 200); print (k > 3000 ? 3000 : k) }'; }
slugs=("$@")
[ ${#slugs[@]} -eq 0 ] && for f in src/cases/*.json; do slugs+=("$(basename "$f" .json)"); done
for slug in "${slugs[@]}"; do
  [ -f "out/$slug-preview.mp4" ] && { echo "SKIP $slug"; continue; }
  if npx remotion render "$slug" "out/$slug.mp4" --codec=h264 --log=error; then
    npx --no-install remotion ffmpeg -hide_banner -loglevel error -y -i "out/$slug.mp4" -c:v libx264 -b:v "$(preview_kbps "out/$slug.mp4")k" -maxrate "$(preview_kbps "out/$slug.mp4")k" -bufsize 6000k -c:a copy "out/$slug-preview.mp4"
    echo "OK $slug"
  else
    echo "FAIL $slug"
  fi
done
echo DONE
