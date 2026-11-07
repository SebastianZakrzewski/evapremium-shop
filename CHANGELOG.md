# Zmiany

## 2026-11-07 — remediacja zależności na gałęzi produkcyjnej

Gałąź: `cursor/prod-perf-paynow-017b`.
BASE: `67f71beef2e22086692d98218082d873a0ef0667`.
Poprzedni HEAD z optymalizacją obrazów i koszykiem: `6050414d024d5caa54ded4b2cf685bf8db233790`.
Commit zależności: `d5b3858b6f1137c5a562b6513ba9276053de263b`.
Środowisko testu: Node.js 22.23.4 na maszynie wirtualnej. Vercel zostaje na Node 22.x. Lokalny Windows (Node 24) nie był uruchamiany i nie był zmieniany.

Nie było pusha, pull requestu, merge ani wdrożenia. Alias `www.evapremium.pl` nie był ruszany. Cel wycofania, wyłącznie planistyczny: deployment `dpl_8z2mC6E1X2mZcScnx6aTaNpesjTD`.

### Zależności bezpośrednie

| Pakiet | Było (zainstalowane) | Jest (zainstalowane) |
| --- | --- | --- |
| next | 16.0.10 | 16.4.5 |
| sharp (przez next) | 0.34.4 | 0.35.5 |
| postcss | 8.5.6, a w next 8.4.31 | 8.5.32, a w next 8.5.23 |
| zod | 3.25.74 | 3.25.76 |
| sqlite3 | 5.1.7 | 6.0.1 |
| server-only | brak w drzewie po Next 16.4 | 0.0.1 |
| @types/three | 0.181.0 | 0.187.0 |
| @types/node | 20.x | 22.x |
| vitest | 1.6.1 | 5.1.0 |
| vite | 5.4.20 | 6.4.5 |
| eslint | 9.37.0 | 9.39.5 |

Skrypt `lint` woła `eslint .`, bo Next 16.4.5 nie ma już polecenia `next lint`.
Z `next.config.js` usunięto `experimental.turbopackUseSystemTlsCerts`. Next 16.4.5 odrzuca ten klucz. Build produkcyjny dalej idzie przez `next build --webpack`.

Lockfile odświeżony zwykłym `npm install` i `npm update` wskazanych pakietów. Bez `npm audit fix --force` i bez `overrides` wyciszających audyt.

### Łańcuchy przechodnie, które weszły z tym lockfilem

| Pakiet | Było | Jest |
| --- | --- | --- |
| tar | stare drzewo sqlite3/node-gyp | 7.5.22 |
| ws | 8.18.3 | 8.22.1 |
| nanoid | 3.3.11 | 3.3.20 |
| source-map-js | 1.2.1 | 1.2.2 |
| fflate | 0.8.2 | 0.8.3 |
| form-data | 4.0.4 | 4.0.6 |
| flatted | 3.3.3 | 3.4.4 |
| browserslist | 4.25.0 | 4.29.5 |
| esbuild (vite) | 0.21.5 | 0.25.12 |
| @babel/core | starszy niż 7.29.0 | 7.29.13 |
| @humanfs/node | 0.16.7 | 0.16.8 |
| tinypool | 0.8.4 | usunięty razem z Vitest 1 |

### Test nagłówka

`ProductVideoCarouselSection` sprawdza nagłówek „Premium w akcji”, biały `h2` bez czerwonego fragmentu w środku oraz czerwony kicker „Wideo” (`text-red-500`) przed nagłówkiem. Wygląd sekcji bez zmian.

### Czego ten wpis nie zamyka

- GHSA-mrhx-c7xc-m3w5 (zod, high, zakres `< 4.6.6`). Ostatnie 3.x to 3.25.76 i nadal wpada w ten zakres. Zod 4.6.7 zmienia walidację używaną w koszyku, zamówieniu i Paynow (`errorMap`, `required_error`, `z.record`). Major nie został włączony.
- GHSA-g3hv-75wg-m249 (minimatch, moderate, `>= 7.0.0 < 11.0.1`). Zostaje dev-only: `@typescript-eslint/typescript-estree@8.46.0` trzyma `minimatch@9.0.9`. Linia 8.72.1 nadal wymaga `minimatch` `^10.2.2`, czyli też poniżej 11.0.1. Bez override.
- Prawdziwy sandbox Paynow. Ścieżka zakupowa szła na atrapie i proxy z blokadą zapisu.
