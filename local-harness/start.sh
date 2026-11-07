#!/bin/sh
# Start Next on NEXT_PORT and the fixture proxy on PROXY_PORT.
# Browser URL is the proxy, not raw next start.
set -eu
ROOT=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
SHOP=${SHOP_DIR:-$(CDPATH= cd -- "$ROOT/.." && pwd)}
NEXT_PORT=${NEXT_PORT:-3460}
PROXY_PORT=${PROXY_PORT:-3456}
export NEXT_PORT PROXY_PORT

if [ ! -d "$SHOP/node_modules/next" ]; then
  echo "Brak node_modules w sklepie. W katalogu sklepu uruchom: npm ci && npx prisma generate && npx next build --webpack"
  exit 1
fi

if [ ! -f "$SHOP/.env.local" ]; then
  cp "$ROOT/env.local.example" "$SHOP/.env.local"
  echo "Zapisano .env.local z atrapami (bez sekretów produkcji)."
fi

cd "$SHOP"
npx next start -H 127.0.0.1 -p "$NEXT_PORT" > "$ROOT/next.log" 2>&1 &
echo $! > "$ROOT/next.pid"
cd "$ROOT"
node "$ROOT/proxy.mjs" > "$ROOT/proxy.log" 2>&1 &
echo $! > "$ROOT/proxy.pid"

i=0
while [ "$i" -lt 30 ]; do
  if curl -sf -o /dev/null "http://127.0.0.1:${PROXY_PORT}/"; then
    echo "Gotowe. Otwórz http://127.0.0.1:${PROXY_PORT}/"
    echo "Next (bez izolacji zapisu) jest tylko na http://127.0.0.1:${NEXT_PORT}/ — nie używaj go do testu."
    exit 0
  fi
  i=$((i + 1))
  sleep 1
done
echo "Proxy nie wstało. Zobacz $ROOT/proxy.log i $ROOT/next.log"
exit 1
