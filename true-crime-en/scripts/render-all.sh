#!/usr/bin/env bash
# Render every case (9:16) with its current timings, plus a <30 MB preview of each.
# Already-rendered cases are skipped; pass slugs to render only those.
set -uo pipefail
cd "$(dirname "$0")/.."
slugs=("$@")
[ ${#slugs[@]} -eq 0 ] && for f in src/cases/*.json; do slugs+=("$(basename "$f" .json)"); done
for slug in "${slugs[@]}"; do
  [ -f "out/$slug-preview.mp4" ] && { echo "SKIP $slug"; continue; }
  if npx remotion render "$slug" "out/$slug.mp4" --codec=h264 --log=error; then
    npx --no-install remotion ffmpeg -hide_banner -loglevel error -y -i "out/$slug.mp4" -c:v libx264 -b:v 3000k -maxrate 3300k -bufsize 6000k -c:a copy "out/$slug-preview.mp4"
    echo "OK $slug"
  else
    echo "FAIL $slug"
  fi
done
echo DONE
