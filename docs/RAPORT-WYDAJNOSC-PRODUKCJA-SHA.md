# Raport: lokalna optymalizacja kodu produkcji www.evapremium.pl

Pomiar: 7 listopada 2026, 00:27–00:45 czasu Warszawa (maszyna w UTC). Laboratorium: `next build --webpack` i `next start` na porcie 3460, wspólne proxy atrap na `127.0.0.1:3456`. To nie jest CrUX, INP ani prawdziwy iPhone.

## Baza

Produkcyjny alias wskazuje deployment `dpl_8z2mC6E1X2mZcScnx6aTaNpesjTD`. Metadane tego wdrożenia wskazują repozytorium `evapremium-shop`, gałąź `feat/paynow-only`, pełny SHA:

`67f71beef2e22086692d98218082d873a0ef0667`

(`fix(checkout): fire purchase tracking when Paynow success flips pending to paid`)

Poprzedni BASE `c906ed86` nie jest tą produkcją. Między nim a tym SHA jest 36 commitów w jedną stronę i 4 w drugą. Stara paczka z `cursor/perf-smoothness-017b` nie była nakładana.

Nowa gałąź lokalna: `cursor/prod-perf-paynow-017b` w worktree `/agent/repos/evapremium-shop-prod`. Stara gałąź `cursor/perf-smoothness-017b` (HEAD `7ca0233`) została bez zmian. Nie było pusha, PR, merge ani deployu. Nie użyto produkcyjnego service role i nie było zapisów do bazy, storage, zamówień, płatności ani analityki.

## Jak porównanie jest uczciwe

Oba buildy (sam SHA oraz ten SHA plus poprawki) stały za tym samym proxy:

- `GET /api/models`, `/api/car-brands`, `/api/search`, `/api/vehicle-catalog` i `POST /api/pricing/resolve` zwracają tę samą atrapę.
- `POST` na `/api/orders`, `/api/payments`, `/api/bitrix`, `/api/cart`, `/api/abandoned-carts` dostaje 403.
- Skrypty Cookiebot, GTM, Analytics, Facebook, Clarity i Paynow są zrywane w przeglądarce testowej. Strategia `beforeInteractive` w layoucie nie była zmieniana. Logika zakupu Paynow nie była ruszana.
- Ten sam stan zgody na zrzutach: baner „Cenimy Twoją prywatność” przed wyborem.
- Ten sam URL konfiguratora: `/konfigurator?brand=hyundai&model=tucson&year=2024&bodyType=suv`.
- Lighthouse 12.8.2, 3 przebiegi, `throttlingMethod: simulate`. Mobile 390×844 DPR 2. Desktop 1350×940 DPR 1.

`next build` bez `--webpack` pada na Turbopacku przy dwóch fontach Google (`next/font/google queries have exactly one entry`). Oba buildy użyły `--webpack`. `tsconfig` wyklucza `prisma/**`, bo skrypty importują `PrismaClient` z `@prisma/client`, a klient jest generowany do `src/generated/prisma`. To odblokowanie buildu, nie zmiana UI.

## Mediany

| Trasa | | LCP | CLS | TBT | transfer | obrazy |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `/` mobile | przed | 41,0 s | 0,000 | 154 ms | 9,42 MB | 8,68 MB |
| `/` mobile | po | 7,0 s | 0,000 | 78 ms | 2,46 MB | 1,72 MB |
| `/` desktop | przed | 41,2 s | 0,000 | 175 ms | 9,57 MB | 8,76 MB |
| `/` desktop | po | 6,8 s | 0,000 | 107 ms | 2,52 MB | 1,71 MB |
| `/dywaniki?brand=hyundai` mobile | przed | 6,77 s | 0,057 | 94 ms | 980 KB | 239 KB |
| `/dywaniki?brand=hyundai` mobile | po | 6,78 s | 0,057 | 94 ms | 980 KB | 239 KB |
| konfigurator z Hyundai Tucson | przed | 11,8 s | 0,017 | 171 ms | 6,46 MB | 5,68 MB |
| konfigurator z Hyundai Tucson | po | 7,83 s | 0,017 | 181 ms | 1,25 MB | 467 KB |

Dywaniki są tym samym UI atrapy („3 modele” dla Hyundai: Tucson SUV, Tucson kombi, i30). CLS 0,057 jest w obu, więc ta zmiana go nie ruszyła. Konfigurator w obu przebiegach maluje typy dywanika i próbki kolorów; różnica bajtów to rozmiar plików, nie puste kontra pełne UI.

## Skąd się brało LCP strony głównej

Ślad `lcp-breakdown-insight` dla home mobile po zmianie (przebieg 2): TTFB 7 ms, opóźnienie startu zasobu LCP 10 ms, pobieranie zasobu 18 ms, opóźnienie renderu elementu 108 ms. To są czasy obserwowane w audycie składowych, nie mediana symulowanego LCP.

Symulowany LCP 41 s przed zmianą pokrywa się z pobraniem obu PNG hero (`jesien_hero.png` 2,46 MB i `jesien_mobile_hero.png` 2,16 MB) oraz pełnych plików galerii. Audyt `offscreen-images` wskazał konkretne `<img>` w `div.swiper-wrapper` karuzeli filmów, ze źródłem `/galeria/photo_….webp` (ok. 350 KB przy wyświetlaniu ok. 222×297). To nie jest wniosek „winny jest Cookiebot”. Skrypt zgody został zablokowany tak samo w obu seriach; `beforeInteractive` nie był zmieniany.

Po zmianie mobile pobiera jeden plik LCP: `/images/hero/responsive/jesien-mobile-941.avif` (159 KB). Oryginalne `/galeria/photo_*.webp` mają 0 B w śladzie home mobile; zamiast nich jest ok. 766 KB `/galeria/display/`. Symulowany LCP zostaje ok. 7 s, bo w kolejce jest nadal ok. 1,7 MB obrazów (miniatury galerii, porównanie, ikony). Labowe TBT nie jest INP.

## Co zmieniono w tym SHA

- Hero: jeden `<picture>` z AVIF/WebP i `srcset`. PNG zostaje fallbackiem. Serwer nie składa już dwóch `<img>`, z których mobile i tak ciągnął oba.
- Karuzela filmów: plakat slajdu wskazuje 640 px WebP z `public/galeria/display/`. Slajd nieaktywny ma `loading="lazy"`. Film nadal ładuje się dopiero gdy karta jest aktywna (`preload` bez zmian dla aktywnego).
- Galeria zdjęć: kafelki idą na te same miniatury; lightbox dostaje `fullSrc` oryginału. Jakość Next/Image 75.
- Próbki koloru konfiguratora: plik 96 px WebP z `display/`, bez `unoptimized` i bez quality 100. Ikona typu dywanika idzie przez optimizer w zadeklarowanym rozmiarze 224 px, nie jako cały plik.
- Licznik modeli w trakcie `loading` pokazuje „Ładowanie modeli…”, nie „0 modeli”.

Wygląd baneru jesiennego, nawigacji i banera zgody na zrzutach 1280 px jest ten sam układ co przed zmianą.

## Testy

- `tsc --noEmit`: sukces.
- `next build --webpack`: sukces.
- Vitest: hero, slider, próbki, ikona typu — sukces. `ProductVideoCarouselSection` ma 1 wcześniejszy fail (`heading.querySelector(".text-red-500")` jest puste; nagłówek idzie przez `ShopSectionHeading`). Plakat w tym teście przechodzi na ścieżce `display`.
- Chromium: brak poziomego overflow przy 320 px. Hyundai „3 modele”. BMW pokazuje X5. Konfigurator pokazuje „Hyundai Tucson”, typy 3D i struktury. Submit checkout nie wywołał zapisu (0 żądań). Firefox i WebKit niedostępne.

Pełna ścieżka rok → zmiana ceny 319/559 → dodanie do koszyka → reload → ilość → checkout z walidacją nie została domknięta. Kontrolka roku nie jest natywnym `select`, a atrapa katalogu nie wstawiła w UI wariantów „Przód” / „Komplet”. `POST /api/pricing/resolve` na proxy zwraca 319 i 559, ale ekran przy tym URL zostaje przy „Wybierz wariant aby zobaczyć cenę”.

## Artefakty

- Zrzuty przed: `/opt/cursor/artifacts/prod-perf/shots/before/` (`home-320`, `home-360`, `home-390`, `home-1280`, `home-1440`, `dywaniki-390`, `dywaniki-1280`, `konf-390`, `konf-1440`)
- Zrzuty po: `/opt/cursor/artifacts/prod-perf/shots/after/` (te same nazwy plus `checkout-390`)
- JSON Lighthouse: `/opt/cursor/artifacts/prod-perf/lighthouse/before/` i `after/`
- Paczka: `/opt/cursor/artifacts/prod-perf/perf-paynow-67f71be.patch`
- Stara paczka `cursor/perf-smoothness-017b` zostaje, ale do tego SHA jej nie stosować.

## Uruchomienie

```bash
git worktree add -b cursor/prod-perf-paynow-017b /ścieżka 67f71beef2e22086692d98218082d873a0ef0667
# albo git apply paczki na czystym SHA
```

`.env.local` tylko z atrapami (`NEXT_PUBLIC_SUPABASE_URL=https://local-fixture.invalid`, `SUPABASE_SERVICE_ROLE_KEY=local-fixture-not-a-production-key`, `NEXT_PUBLIC_TRACKING_ENABLED=false`, `P24_ENABLED=false`, `PAYNOW_ENABLED=false`). Potem `npm ci`, `npx prisma generate`, `npx next build --webpack`, `npx next start -H 127.0.0.1 -p 3460`. Proxy atrap jest opisane w tym raporcie jako narzędzie laboratorium (`/tmp/prod-harness/proxy.mjs` na tej maszynie), nie jako kod produkcji.

## Czego to nie dowodzi

- Prawdziwych WebP z `mat_model_previews` i cennika z bazy.
- Równoważności z CrUX albo INP.
- iOS, Firefox, WebKit.
- Pełnego zakupu Paynow. Integracja płatności i śledzenie zakupu po opłaceniu nie były odpalane.
- CLS 0,057 na liście Hyundai zostaje.
- Symulowane 7 s LCP na stronie głównej zostaje przez resztę obrazów (ok. 1,7 MB), nie przez sam hero 159 KB.
