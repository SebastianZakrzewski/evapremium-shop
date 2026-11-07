# Lokalny harness (bez bazy i bez płatności)

Przeglądarka ma wchodzić na proxy, nie na goły `next start`.

Goły `next start` (domyślnie port 3460) woła host z `.env.local`. Przy atrapie `https://local-fixture.invalid` katalog pada, a `POST /api/orders`, `/api/payments` i `/api/abandoned-carts` nie są odcinane. Proxy na porcie 3456 podmienia odczyt katalogu i cen oraz zwraca **403** dla zapisów.

Oczekiwane 403:

- `POST /api/orders`
- `POST /api/payments` (także Paynow)
- `POST /api/bitrix` i `/api/bitrix24`
- `POST /api/abandoned-carts` oraz `/api/abandoned-carts/webhook`
- `POST /api/cart`

## Uruchomienie

W katalogu sklepu (worktree z gałęzi `cursor/prod-perf-paynow-017b`):

```sh
npm ci
npx prisma generate
npx next build --webpack
```

Potem w tym katalogu `local-harness`:

```sh
npm ci
chmod +x start.sh stop.sh
./start.sh
```

Adres: `http://127.0.0.1:3456/`

Zatrzymanie: `./stop.sh`

Inne porty: `NEXT_PORT=3460 PROXY_PORT=3456 ./start.sh`

## Ścieżka zakupu

Wymaga Chrome albo Chromium. Ścieżka z `CHROME_PATH` albo z `PATH` (`google-chrome`, `google-chrome-stable`, `chromium`, `chromium-browser`).

```sh
npm run journey
```

Skrypt klika Markę, Model, Generację, Rok produkcji, skrzynię, nadwozie, typ, warianty `Przód` i `Przód + tył`, koszyk i checkout. Nie wysyła zamówienia. Na końcu wypisuje `consoleerrors`.

`SHOP_DIR` ustaw, jeśli harness nie leży w podkatalogu sklepu.
