# Zod 4.6.7 i sandbox Paynow — 7 listopada 2026

Wdrożenie: **NO-GO**. Ta runda zamyka advisory Zod w lockfile i nie uruchamia płatności. Nie było pusha, PR, merge, zmiany aliasu Vercel ani zapisu do produkcji. Kopia na Windowsie nie była ruszana.

Gałąź `cursor/prod-perf-paynow-017b`. BASE `67f71beef2e22086692d98218082d873a0ef0667`. Tip przed tą rundą `4fca5e28be6d74dafad5d4b161d379c7d3fa4f38`. Node.js 22.23.4.

## Zod

GitHub Advisory API: GHSA-mrhx-c7xc-m3w5, high, CVE-2023-54404. Zakres podatny: `< 4.6.6`. Pierwsza poprawiona wersja: 4.6.6. Rejestr npm w dniu zmiany: najnowszy stabilny `zod` to 4.6.7. Zainstalowano `^4.6.7`, rozwiązane jako 4.6.7. Bez `npm audit fix --force` i bez innych podbić.

Zod 4 nie przyjmuje `errorMap` ani `required_error`. Te pola były ignorowane i dawały angielski komunikat. Zamiana:

- koszyk i pozycja zamówienia: `error: 'Typ produktu musi być "accessory" lub "mat"'`
- akcja koszyka: `error: 'Akcja musi być: add, remove, update, lub clear'`
- checkout: `error: "Wybierz metodę płatności"`
- `z.record(wartość)` → `z.record(z.string(), wartość)` w porzuconym koszyku i Bitrixie
- trzy trasy podglądu zdjęć zwracają `details: error.issues` (w Zod 4 nie ma `.errors`)

Schemat checkoutu jest w `src/features/checkout/model/checkoutSchema.ts`. Treść reguł jest ta sama. Test `src/lib/validators/zod4-contracts.test.ts` sprawdza komunikaty polskie, NIP `123-456-32-18` → `1234563218`, statusy Paynow `CONFIRMED`/`NEW` oraz odrzucenie `PAID`, sesję krótszą niż 8 znaków, puste `items`/`metadata`, pustą skrzynię biegów i `year: "2024"` → `2024`.

Ceny, próg 637 zł, dostawa 27 zł, dostawca płatności, zgoda i analityka bez zmian.

| Polecenie | Kod | Wynik |
| --- | ---: | --- |
| `npx vitest run` | 0 | 718 zaliczonych, 0 niezaliczonych, 142 pliki (wcześniej 712/0) |
| `npx tsc --noEmit` | 0 | |
| `npx eslint .` | 0 | 0 błędów, 553 ostrzeżenia |
| `npx next build --webpack` | 0 | |
| `npm audit` | 0 | 6 średnie, 0 wysokie, 0 krytyczne. Zostaje dev-only minimatch GHSA-g3hv-75wg-m249 |
| `npm audit --omit=dev` | 0 | 0 podatności |

## Paynow sandbox: NOT VERIFIED

Oficjalny SDK `pay-now/paynow-php-sdk`, plik `src/Paynow/Configuration.php`:

- sandbox: `https://api.sandbox.paynow.pl`
- produkcja: `https://api.paynow.pl`

Ten sam podział jest w `src/lib/config/paynow.ts`. Nie wykonano żadnego wywołania HTTP do tych hostów.

W tym środowisku przejrzane pliki `.env.local`, `env.example` i `local-harness/env.local.example` (worktree sklepu i katalog nadrzędny) oraz zmienne procesu. Jedyna zmienna Paynow to `PAYNOW_ENABLED=false`. Nie ma ustawionych:

- `PAYNOW_API_KEY`
- `PAYNOW_SIGNATURE_KEY`
- `PAYNOW_ENVIRONMENT`
- `PAYNOW_RETURN_URL`
- `PAYNOW_RETURN_URL_LOCAL`
- `PAYNOW_NOTIFICATION_URL`
- `PAYNOW_NOTIFICATION_URL_LOCAL`

Bez klucza i klucza podpisu nie da się udowodnić, że para jest wyłącznie sandboxowa. Sama nazwa zmiennej nie wystarcza. Nie pobierano sekretów produkcji i nie zakładano konta.

Żeby jeden przebieg sandboxu był możliwy później, potrzeba izolowanego środowiska:

1. Klucze wystawione w panelu Paynow dla środowiska sandbox, nie produkcji.
2. `PAYNOW_ENVIRONMENT` tak, by kod wybrał `https://api.sandbox.paynow.pl`.
3. `PAYNOW_RETURN_URL_LOCAL` i `PAYNOW_NOTIFICATION_URL_LOCAL` wskazujące na lokalny proces, nie na `www.evapremium.pl`.
4. Osobna baza testowa. Ta runda jej nie miała, więc rejestracja płatności i tak nie mogłaby zapisać zamówienia bez ryzyka ruchu produkcyjnego.

Testy atrap Paynow nie są weryfikacją sandboxu.
