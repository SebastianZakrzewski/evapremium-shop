# EVAMATS – normalized pricing (from Excel)

Source: `CENNIK EVAMATS (3).xlsx`, sheets **Cennik**, **MinivanAuto osoboweBUSPickup**, **Wariant kompletu Bitrix**.

**Format:** `locale: en`, all keys `snake_case`, identifiers use `_` instead of spaces.

## Files

| File | Layer |
|------|-------|
| `evamats-pricing.index.json` | Index + category → pricing table + Bitrix segment |
| `evamats-pricing-segments.json` | Unified structure per vehicle segment |
| `evamats-cennik.normalized.json` | Pricing by vehicle category |
| `evamats-vehicle-category-mapping.normalized.json` | Car model → category |
| `evamats-bitrix-variant-mapping.normalized.json` | Bitrix set variant labels |

## Vehicle categories (English)

| Key | Pricing table |
|-----|---------------|
| `minivan` | `minivan` |
| `passenger_car` | `passenger_car` |
| `bus` | `bus` |
| `pickup` | `pickup` |
| `custom_quote` | `null` |

## Flow

1. Find model in `vehicle-category-mapping` by `model_key`
2. Read `vehicle_category` (e.g. `passenger_car`)
3. From index: `vehicle_category_to_pricing_table.passenger_car` → `passenger_car`
4. Load price from `evamats-cennik.normalized.json` → `categories.passenger_car.items`
5. Bitrix labels from `evamats-bitrix-variant-mapping.normalized.json` → `segments.passenger_car.variants`

## Regenerate

```bash
npx xlsx-cli "%USERPROFILE%/Downloads/CENNIK EVAMATS (3).xlsx" --sheet "Cennik" -J -o output/cennik-sheet-raw.json
npx xlsx-cli "%USERPROFILE%/Downloads/CENNIK EVAMATS (3).xlsx" --sheet "MinivanAuto osoboweBUSPickup" -J -o output/vehicle-mapping-sheet-raw.json
npx xlsx-cli "%USERPROFILE%/Downloads/CENNIK EVAMATS (3).xlsx" --sheet "Wariant kompletu Bitrix" -J -o output/bitrix-variant-sheet-raw.json
node scripts/normalize-cennik-evamats.mjs
```

## Field naming

| Old (PL/camelCase) | New (EN/snake_case) |
|--------------------|---------------------|
| `auto_osobowe` | `passenger_car` |
| `variantLabel` | `variant_label` |
| `variantKey` | `variant_key` |
| `modelKey` | `model_key` |
| `vehicleCategory` | `vehicle_category` |
| `pricePln` | `price_pln` |
| `rims3d` | `rims_3d` |
