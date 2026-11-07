# Raport naprawy testów — 7 listopada 2026

Werdykt wdrożenia: **nadal NO-GO**. Zielone testy jednostkowe nie sprawdzają sandboxu Paynow. Zod 3 i GHSA-mrhx-c7xc-m3w5 zostają bez zmian. Nie było pusha, PR, merge ani deployu. Kopia na Windowsie nie była ruszana.

Gałąź `cursor/prod-perf-paynow-017b`. Baza produkcyjna `67f71beef2e22086692d98218082d873a0ef0667`. Tip przed tą rundą `9c1d796fbb89a2bccdabec9f269998ea1b898860`. Node.js 22.23.4.

## Skąd brało się 48 czerwonych testów

Porównanie `git diff 67f71be HEAD` dla tych plików źródłowych: implementacje `OrderService`, `ConfiguratorService`, `Przelewy24Service`, `StageMappingService`, `DealService`, `carmat-service` i obu tras porzuconego koszyka są identyczne z produkcyjnym BASE. To nie jest regresja z Next 16.4.5 ani ze strategii cen. `CartService.ts` różni się tylko kopią tablicy przy zmianie ilości; stary test wołał metody, których nie było już na BASE.

| Plik | Dowód | Naprawa |
| --- | --- | --- |
| `CartService.test.ts`, `integration.test.ts` | Statyczne `addProductToCart` / `createOrder` / `getCartProducts` nie istnieją na klasach z BASE | Testy wołają `addToCart`, `updateQuantity`, `removeFromCart`, `clearCart` i `OrderService.createOrder` z atrapą repozytorium |
| `OrderService.test.ts` | To samo, plus import prawdziwego klienta Supabase przy pustym URL | Atrapa `@/lib/database/supabase` i `OrderRepository`. Brak sieci |
| `ConfiguratorService.test.ts` | `calculatePricing` jest na `ProductFactory`, nie na serwisie. Pięta w `PricingService.calculateMatPrice` ma dopłatę `0` z komentarzem „wyzerowane”. Kolor obszycia nie wchodzi do strategii | Asercje trzymają ceny strategii: classic basic 408, 3D basic 637, classic < 3D. Pięta i kolor obszycia nie zmieniają tej ceny |
| `Przelewy24Service.test.ts` | Od BASE `registerTransaction` czyta `response.text()`, atrapa dawała tylko `json()` | Atrapa zwraca `text()` z tym samym JSON. P24 zostaje wyłączone w aplikacji |
| `heartbeat.test.ts` | `sessionId: 's2'` ma 2 znaki, schemat wymaga `min(8)`, trasa zwraca 400 | Identyfikator `session-s2`. Asercja 15 minut zostaje |
| `webhook.test.ts` | Łańcuch Supabase nie był thenable, więc `insert().select()` rzucał i trasa łapała 400 | Pamięciowy klient i atrapa `dealService` oraz guardów zamówień. Oczekiwane `dealId: D999` zostaje |
| `StageMappingService.test.ts` | Na BASE płatność ma pierwszeństwo: `paid` → `UC_DMBNNJ`, zanim kod dojdzie do `delivered` → `WON` | Opłacone i dostarczone zostaje `UC_DMBNNJ`. Osobny test: dostarczone przy płatności `pending` albo bez statusu płatności daje `WON` |
| `dealService.*.test.ts` | `stageMappingService` jest singletonem z własnym `Bitrix24Client`. Ten klient widzi `BITRIX24_WEBHOOK_ENABLED` atrapy i rzuca „disabled”. Test podawał mock do `DealService`, którego resolve stage nie używa | Test podpina ten sam mock pod klienta mapowania i atrapuje kontakt. Kategoria 7 i etapy `UC_ABC` / `UC_PORZ` zostają. Produkcyjna flaga Bitrixa bez zmian |
| `carmat-service.test.ts` | `jest.mock` nie istnieje w Vitest, a `require('@supabase/supabase-js')` brał prawdziwy klient | `vi.mock` i jeden thenable. `getMatById` szuka prefiksu hex `cb465347` |

Ceny, próg dostawy 637 zł i opłata 27 zł nie były ruszane. Pusty koszyk w `OrderService.createOrder` nadal tworzy zamówienie ze `subtotal` 0 i dostawą 27 zł. Test to zapisuje. Nie dodałem rzucania błędu, bo to zmieniłoby checkout.

Ilość 0 w `CartService.updateQuantity` zostawia pozycję z ilością 0. Usunięcie jest osobną metodą `removeFromCart`. Tak jest na BASE.

## Wyniki

Polecenia i kody wyjścia na Node 22.23.4:

| Polecenie | Przed | Po |
| --- | --- | --- |
| `npx vitest run` | kod 1, 654 zaliczone, 48 niezaliczone, 11 plików | kod 0, **712 zaliczone, 0 niezaliczonych**, 141 plików |
| `npx tsc --noEmit` | — | kod 0 |
| `npx eslint .` | 2 błędy, 586 ostrzeżeń | kod 0, **0 błędów, 553 ostrzeżenia** |
| `npx next build --webpack` | — | kod 0 |

Ostrzeżenia ESLint nie były czyszczone. Dwa błędy: `prefer-const` w `brand-selection-grid.tsx` oraz `<a href="/dywaniki">` zamienione na `next/link` w `BrandsScrollingCarousel.tsx` (ten sam adres).

Nie ma nierozwiązanych testów z tamtej listy 48. Paynow sandbox nadal nie był odpalony. Testy płatności i Bitrixa idą przez atrapy i nie wołają sieci dostawcy.
