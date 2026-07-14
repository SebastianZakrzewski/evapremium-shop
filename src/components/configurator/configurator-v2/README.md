# Konfigurator V2

Layout inspirowany UX konfiguratora Tesli, z logiką biznesową EvaPremium (dywaniki EVA).

## Trasa

- **Testowa:** `/konfigurator-v2` (`noindex`)
- **Produkcja (V1):** `/konfigurator` — bez zmian

## Użycie

```tsx
import { ConfiguratorV2 } from "@/components/configurator/configurator-v2"

export default function Page() {
  return <ConfiguratorV2 />
}
```

Wejście z produktu (zablokowany pojazd):

```
/konfigurator-v2?brand=audi&model=A4
```

## Architektura

- **Stan:** `useConfiguratorState` (osobny klucz localStorage: `configurator-v2-state`)
- **Cennik:** `useResolvedPricing` → `/api/pricing/resolve`
- **Mapowanie sekcji:** `mapConfiguratorV2Sections` w `features/car-configurator/adapters/`
- **Koszyk:** ten sam `MatConfiguration` co V1

## Sekcje (scroll, bez kroków)

| Sekcja | Odpowiednik Tesli |
|--------|-------------------|
| Pojazd | Model + kontekst |
| Typ dywanika | Wersja napędu |
| Wariant zestawu | Trim |
| Struktura komórek | Koła |
| Kolor materiału | Lakier |
| Kolor obszycia | Wnętrze |
| Akcesoria | Upsell |

## Modale

- `PriceBreakdownModal` — rozbicie ceny (klik w sticky bar)
- `CompareMatTypesModal` — porównanie typów dywaników
- `CompareVariantsModal` — porównanie wariantów zestawu
- `MatFeaturesModal` — edukacja o produkcie EVA
