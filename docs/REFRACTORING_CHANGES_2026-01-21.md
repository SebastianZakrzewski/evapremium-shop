# Refaktoryzacja konfiguratora - zmiany (2026-01-21)

## Zakres
Refaktoryzacja logiki cenowej konfiguratora w celu oddzielenia logiki domenowej od warstwy UI.

## Wykonane zmiany
- Wydzielono moduł domenowy z obliczeniami cen do `src/features/car-configurator/domain/pricing.ts`.
- Dodano testy jednostkowe logiki cenowej w `src/features/car-configurator/domain/__tests__/pricing.test.ts`.
- Zmieniono `src/components/configurator/Configurator.tsx`, aby korzystał z nowego modułu domenowego zamiast lokalnych stałych i obliczeń.
- Ujednolicono typy `setType` i `setVariant` w komponencie (ścisłe typy `SetTypeId`, `SetVariantId`).
- Dodano eksport modułu domenowego w `src/features/car-configurator/index.ts`.

## Szczegóły techniczne
- Logika cenowa (rabat, wysyłka, breakdown) została przeniesiona do funkcji:
  - `getBasePrice`
  - `calculatePriceBreakdown`
  - `calculateVariantBasePrice`
  - `calculateVariantPrice`
- Komponent `Configurator.tsx` używa teraz powyższych funkcji i nie zawiera własnej logiki cenowej.

## Pliki zmodyfikowane / dodane
- `src/features/car-configurator/domain/pricing.ts` (nowy)
- `src/features/car-configurator/domain/__tests__/pricing.test.ts` (nowy)
- `src/components/configurator/Configurator.tsx`
- `src/features/car-configurator/index.ts`

## Testy
Nie uruchamiano automatycznie. Rekomendowane uruchomienie:
- `npx vitest run src/features/car-configurator/domain/__tests__/pricing.test.ts`
