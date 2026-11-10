#!/bin/sh
# usage: shot.sh <path> <name> [width] [height] [light]
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
DIR="$(cygpath -w /c/Users/jurge/Documents/mathias/VoS/.scratch/shots)"
OUT="$DIR\\$2.png"
URL="http://localhost:4321$1"; [ -n "$5" ] && URL="$URL?theme=light"
DARK="--force-dark-mode --blink-settings=preferredColorScheme=0"; if [ -n "$5" ]; then DARK="--blink-settings=preferredColorScheme=1"; fi
"$EDGE" --headless=new --disable-gpu --hide-scrollbars $DARK --virtual-time-budget=5000 --window-size="${3:-1440},${4:-1400}" --screenshot="$OUT" "$URL" >/dev/null 2>&1
echo "$OUT"
