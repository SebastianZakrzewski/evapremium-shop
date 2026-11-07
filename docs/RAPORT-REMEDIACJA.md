# Raport remediacji — 7 listopada 2026

Werdykt: **NO-GO na wdrożenie**.

Krytyczne advisory Next.js i sharp są zamknięte w lokalnym lockfile. Na produkcji zostaje jednak Zod 3 (GHSA-mrhx-c7xc-m3w5, high), Paynow nie był odpalony na sandboxie dostawcy, a ten pakiet nie został wdrożony. Alias `www.evapremium.pl` nadal wskazuje `dpl_8z2mC6E1X2mZcScnx6aTaNpesjTD` (SHA `67f71beef2e22086692d98218082d873a0ef0667`, gałąź `feat/paynow-only`). Wycofanie na ten deployment jest tylko planem. Nie było rollbacku, pusha, PR, merge ani zapisu do bazy, storage, zamówień, płatności i analityki.

Kopia na Windowsie nie była ruszana. Paczka jest do późniejszego `npm ci` na tamtym komputerze.

## Tożsamość

| | |
| --- | --- |
| Gałąź | `cursor/prod-perf-paynow-017b` |
| BASE | `67f71beef2e22086692d98218082d873a0ef0667` |
| Poprzedni HEAD (obrazy + koszyk) | `6050414d024d5caa54ded4b2cf685bf8db233790` |
| Commit zależności | `d5b3858b6f1137c5a562b6513ba9276053de263b` |
| Node testu | 22.23.4 |
| Node Vercel | 22.x |
| Node na Windowsie | 24, poza tym przebiegiem |
| Projekt | `eva-website-v0.1-alpha` / `prj_zkw62hYwlxyLvscsscXvbPtY8hDT` |
| Zespół | `team_MdTgnygoBRHVgSwLhYQBRWW7` |

`get_project` nie podał `rootDirectory` ani komend install/build. Tych wartości tu nie ma.

## Audyt przed i po

Źródło „przed”: `verify-readiness` (`npm audit` na lockfile identycznym z BASE). Źródło „po”: ten sam rejestr po nowym lockfile, 7 listopada 2026.

| Zakres | Przed | Po |
| --- | ---: | ---: |
| Wszystkie zależności | 31 (krytyczne 4, wysokie 20) | 7 (krytyczne 0, wysokie 1, średnie 6) |
| `npm audit --omit=dev` | 18 (krytyczne 2, wysokie 13) | 1 (wysokie 1: zod) |

To jest licznik advisory, nie dowód wykorzystania.

### Zamknięte w drzewie runtime

Potwierdzone w GitHub Advisory API i w `npm audit` po instalacji.

| Pakiet | Było | Jest | Pierwsza poprawiona wersja |
| --- | --- | --- | --- |
| next | 16.0.10 | 16.4.5 | 16.4.1 dla GHSA-2464-fhr4-w9xw i GHSA-673q-mjm6-r5xr (zakres `>=16.0.0 <=16.4.0`) |
| sharp | 0.34.4 | 0.35.5 | 0.35.5 dla GHSA-wq5f-xc86-pv6w (`< 0.35.5`), a także GHSA-f88m-g3jw-g9cj i GHSA-rgj7-g3m4-5g8c |
| postcss | 8.4.31 w next, 8.5.6 obok | 8.5.23 w next, 8.5.32 obok | powyżej 8.5.22 (GHSA-fxqj-rqcc-2cmp i wcześniejsze z listy audytu) |
| tar | stare zagnieżdżenie sqlite3 5 / node-gyp | 7.5.22 | powyżej 7.5.20 |
| sqlite3 | 5.1.7 | 6.0.1 | major, bo tylko 6.0.1 wyciąga `tar` `^7.5.10` |
| ws | 8.18.3 | 8.22.1 | 8.21.0 dla GHSA-96hv-2xvq-fx4p |
| nanoid | 3.3.11 | 3.3.20 | 3.3.18 |
| source-map-js | 1.2.1 | 1.2.2 | 1.2.2 |
| fflate | 0.8.2 | 0.8.3 | 0.8.3 |
| form-data | 4.0.4 | 4.0.6 | 4.0.6 |

Next 16.4.5 jest najnowszym stabilnym 16.x w rejestrze npm w dniu pomiaru (`dist-tag latest`). React zostaje na 18. Peer Nexta na to pozwala. To nie jest migracja na React 19.

`sqlite3` jest w `dependencies`, ale w `src/` nie ma importu. Podbicie do 6.0.1 jest po to, żeby z produkcji zniknął stary `tar`/`node-gyp`/`ip-address`. Silnik pakietu: Node `>=20.17.0`. Node 22 i Node 24 ten warunek spełniają. Prebuild był sprawdzony tylko na tym Linuksie.

### Zamknięte w narzędziach (dev)

| Pakiet | Było | Jest | Po co |
| --- | --- | --- | --- |
| vitest | 1.6.1 | 5.1.0 | GHSA-5xrq-8626-4rwp (`< 3.2.6`) i tinypool GHSA-5gmw-xhrv-c9v3 / GHSA-85c8-ppgw-ccpr. Audyt wskazywał poprawkę dopiero w Vitest 5.1.0 |
| vite | 5.4.20 | 6.4.5 | najmniejsza linia zgodna z Vitest 5 (`^6.4.0`) powyżej advisory `<= 6.4.3` |
| esbuild | 0.21.5 | 0.25.12 | GHSA-67mh-4wv8-2f99 (`<= 0.24.2`) |
| eslint | 9.37.0 | 9.39.5 | ten sam major; ciągnie flatted 3.4.4 i `@humanfs/node` 0.16.8 |
| @babel/core | — | 7.29.13 | GHSA-4x5r-pxfx-6jf8 |
| browserslist | 4.25.0 | 4.29.5 | GHSA-c83g-rgw3-j3cx, GHSA-73wf-gq98-2v4g |
| tinypool | 0.8.4 | brak | Vitest 5 go nie używa |

Vitest 5 konstruuje mock przez `function` albo `class`, nie przez strzałkę. Testy, które robią `new Serwis()` na atrapie, zostały do tego dostosowane. Semantyka płatności i zgód bez zmian.

`eslint@9.39.5` jest oznaczony przez rejestr jako wersja bez dalszego wsparcia. ESLint 10 nie został włączony.

### Zostaje

**GHSA-mrhx-c7xc-m3w5, high, produkcja.** Zod gromadzi issue dla każdego elementu zbyt dużej tablicy i może zjeść pamięć. Zakres: `< 4.6.6`. Poprawka zaczyna się na 4.6.6, aktualne w rejestrze: 4.6.7. Linia 3 kończy się na 3.25.76 (podbita z 3.25.74) i nadal jest w zakresie. W kodzie są `errorMap`, `required_error`, `z.record` z jednym argumentem i `error.errors` w checkout, zamówieniach i Paynow. Major Zod 4 zmieniłby te kontrakty. Został opisany, nie wyciszony.

**GHSA-g3hv-75wg-m249, moderate, tylko dev.** `minimatch@9.0.9` pod `@typescript-eslint/typescript-estree@8.46.0` (zakres rodzica `^9.0.4`). Poprawka to minimatch 11.0.1. Najnowszy typescript-eslint 8.72.1 nadal deklaruje `minimatch` `^10.2.2`, czyli też podatny. `eslint-config-next` 16 tego nie zdejmuje. Override nie został dodany.

## Testy i build

Node 22.23.4.

| Sprawdzenie | Wynik |
| --- | --- |
| `tsc --noEmit` po świeżym `next build` | sukces (postbuild w buildzie, kod wyjścia 0) |
| `next build --webpack` | sukces, Next 16.4.5, ok. 12 s kompilacji |
| `eslint .` | 2 błędy i 586 ostrzeżeń, oba błędy w plikach nietkniętych tą zmianą: `BrandsScrollingCarousel.tsx` (`<a>` zamiast `Link`) i `brand-selection-grid.tsx` (`prefer-const`) |
| Vitest | 654 zaliczone, 48 niezaliczone, 11 plików na czerwono, 130 plików na zielono |

Nagłówek karuzeli, kontrakt wersji next/sharp/postcss/zod, walidacja koszyka i webhooka Paynow, trasa Paynow „disabled”, P24 „disabled”, zgoda na `trackPageView`, ilość w `CartService.updateQuantity` i dopłata montażu: zielone.

48 czerwonych testów to stare atrapy, nie diff płatności:

- `CartService.test.ts`, `ConfiguratorService.test.ts`, `OrderService.test.ts`, `integration.test.ts` wołają statyczne metody, których klasa już nie ma (`addProductToCart`, `calculatePricing`, `createOrder`).
- `carmat-service.test.ts` używa `jest.mock` w Vitest.
- `Przelewy24Service.test.ts` oczekuje `success: true` przy rejestracji; przy atrapie z wyłączonym P24 wynik jest `false`. Kodu P24 ta zmiana nie ruszała.
- `heartbeat` dostaje 400 zamiast 200, webhook porzuconego koszyka `success: false`, a dwa testy Bitrixa kończą się `Bitrix24 integration is disabled`.
- `StageMappingService`: opłacone i dostarczone daje `UC_DMBNNJ`, test chce `WON`.

Klasyfikacja: te 48 to nie jest zielony przebieg. Nie zostały pominięte. Nie są skutkiem podbicia Nexta w plikach, których diff jest pusty.

## Ścieżka Chromium

Proxy `127.0.0.1:3456`, Next 16.4.5 na `127.0.0.1:3460`. Zapisy `POST /api/orders`, `/api/payments/paynow/register`, `/api/bitrix24/sync`, `/api/abandoned-carts`, `/api/abandoned-carts/webhook`, `/api/cart` zwracają 403 i `{"error":"local harness blocked a write"}`. `GET /api/models?brand=hyundai` zwraca 200.

Journey (atrapa, nie Paynow):

- Hyundai → Tucson → 2020–2026 → 2024 → Automatyczna → SUV
- „Przód” zawiera `319,00`, „Przód + tył” zawiera `559,00`
- koszyk: ilość 1, po dwóch kliknięciach „Zwiększ ilość” ilość 3, po reload nadal 3, „Usuń z koszyka” kasuje pozycję
- checkout: „Dalej” zablokowane bez danych, po danych wchodzi adres, bez regulaminu submit nie schodzi z `/checkout`
- `pageerror`: 0
- jedyne zapisy z przeglądarki: dwa POST-y abandoned-carts, oba przez proxy (403). Brak `POST /api/orders` i Paynow
- `console.error`: 10, wszystkie `useAccessories` przy atrapie Supabase. Tak samo jak w poprzednim raporcie

To jest **MOCK TEST**. Prawdziwy Cookiebot, GTM i Paynow nie były podłączone. Zgoda: testy jednostkowe odrzucenia, braku zgody marketingowej i jednego eventu po zgodzie. Deduplikacja zakupu zostaje w nietkniętym `PaymentSuccess` i `trackGaPurchase` (test `PaymentSuccess.test.tsx` zielony). Nie ma tu dowodu, że żywy webhook Paynow albo baner Cookiebot działa.

Diff względem `6050414` nie zmienia `PaynowService`, tras płatności poza testami, cen, katalogu zgodności ani eventów. `next.config.js` traci tylko odrzucony klucz eksperymentalny.

## Wygląd i Lighthouse

Ten sam harness, Lighthouse 12.8.2, `throttlingMethod: simulate`, mobile 390×844 DPR 2, trzy przebiegi, te same blokady skryptów śledzących. Mediana. To nie jest CrUX ani iPhone.

Pomiar „przed” to działający build Next 16.0.10 (HEAD `6050414`) na tym samym hoście, zanim weszły zależności. „Po” to Next 16.4.5.

| Trasa | | LCP | CLS | TBT | transfer | obrazy |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `/` mobile | przed | 7,08 s | 0 | 297 ms | 3,02 MB | 1,72 MB |
| `/` mobile | po | 7,07 s | 0 | 293 ms | 2,93 MB | 1,61 MB |
| konfigurator Tucson | przed | 6,93 s | 0 | 328 ms | 1,80 MB | 463 KB |
| konfigurator Tucson | po | 7,67 s | 0,017 | 333 ms | 1,79 MB | 434 KB |

LCP strony głównej zostaje przy ok. 7,1 s. Konfigurator w tej serii ma medianę wyższą o ok. 0,7 s, a CLS 0,017 w dwóch z trzech przebiegów (trzeci miał 0 i LCP 6,93 s). Historyczny raport po optymalizacji obrazów miał tu LCP 7,83 s i CLS 0,017. Nie wróciło 11,8 s sprzed miniaturek. Nie przypisuję tej różnicy „zyskowi”.

Zrzuty 1280 i 390: baner jesienny, baner „Cenimy Twoją prywatność”, konfigurator Hyundai Tucson z „3D z rantami” i „Struktura: Romby”. Układ bez przebudowy.

## Zgodność

- Vercel Node 22.x: build i testy na 22.23.4.
- Windows Node 24: spełnia `sqlite3@6` (`>=20.17.0`) i peer typów, ale moduł natywny nie był budowany na Windowsie. Trzeba `npm ci` lokalnie. Ta maszyna nic tam nie instalowała.
- `next dev` na Turbopacku nadal nie jest ścieżką produkcyjną. Build idzie `--webpack`, jak poprzednio, z powodu fontów Google.

## Co zrobić później, bez robienia tego teraz

1. Zdecydować, czy GHSA-mrhx-c7xc-m3w5 zostaje świadomie na Zod 3, czy idzie osobna migracja Zod 4 z testami checkoutu.
2. Sandbox Paynow, osobno od tej atrapy.
3. Dopiero potem wdrożenie. Cel wycofania: `dpl_8z2mC6E1X2mZcScnx6aTaNpesjTD`.
