# EVAMATS – znormalizowany cennik (z Excel)

Źródło: `CENNIK EVAMATS (1).xlsx`, arkusz **Cennik** + **MinivanAuto osoboweBUSPickup**.

## Pliki

| Plik | Warstwa |
|------|---------|
| `evamats-pricing.index.json` | Indeks + mapowanie kategorii → tabela cennika |
| `evamats-cennik.normalized.json` | Cennik wg kategorii pojazdu |
| `evamats-vehicle-category-mapping.normalized.json` | Model auta → kategoria (minivan / auto_osobowe / bus / pickup) |

## Przepływ

1. Z `bodyType` / modelu znajdź wpis w `vehicle-category-mapping` (`modelKey`).
2. Weź `vehicleCategory` (np. `minivan`).
3. Z indeksu: `vehicleCategoryToCennikTable.minivan` → `minivany`.
4. Odczytaj cenę z `evamats-cennik.normalized.json` → `categories.minivany.items`.

## Regeneracja

```bash
npx xlsx-cli "%USERPROFILE%/Downloads/CENNIK EVAMATS (1).xlsx" --sheet "Cennik" -J -o output/cennik-sheet-raw.json
npx xlsx-cli "%USERPROFILE%/Downloads/CENNIK EVAMATS (1).xlsx" --sheet "MinivanAuto osoboweBUSPickup" -J -o output/vehicle-mapping-sheet-raw.json
node scripts/normalize-cennik-evamats.mjs
```

## Uwagi

- Arkusz **Cennik Kwiecień 2026** ma rabaty 25%/35% (osobny export, jeśli potrzebny).
- `variantSlug` (`front`, `basic`, `premium`, `complete`) tylko tam, gdzie nazwa zgadza się z konfiguratorem; reszta ma `null`.
- Kolumna **indywidualna_wycena** w mapowaniu modeli to notatki/ceny specjalne, nie tabela macierzowa.
