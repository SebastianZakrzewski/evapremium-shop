#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
for name in proxy next; do
  if [ -f "$ROOT/${name}.pid" ]; then
    pid=$(cat "$ROOT/${name}.pid")
    kill "$pid" 2>/dev/null || true
    rm -f "$ROOT/${name}.pid"
  fi
done
echo "Zatrzymano proxy i next start tego harnessu."
