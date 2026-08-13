# Mat model previews

Zdjęcia podglądowe produktu (kompozyt auto + dywaniki) powiązane z
`evapremium_shop.mat_templates` (relacja 1:N).

Używane na `/dywaniki?brand=…` (karty modeli) oraz w konfiguratorze
przy wejściu z karty / szybkiego wyszukiwania.

## Body type

Kolumna `body_type_key`:
- `NULL` — podgląd wspólny dla wszystkich typów nadwozia szablonu
- np. `suv`, `sedan`, `hatchback` — podgląd tylko dla tego typu

Model z kilkoma typami nadwozia → osobne rekordy (ten sam lub różny `image_url`).
Karta / konfigurator z innym typem **nie** dziedziczy zdjęcia obcego typu
(tylko dokładne dopasowanie albo rekord z `body_type_key IS NULL`).
Primary: jedno aktywne `is_primary` na parę `(mat_template_id, body_type_key)`.

## API

```text
GET /api/mat-model-previews?recordKey=...
GET /api/mat-model-previews?brandKey=Opel&modelKey=Mokka 1 gen&bodyTypeKey=suv
```

## Usage (Configurator V2)

```tsx
const { previews } = useMatModelPreviews({
  recordKey: config.recordKey || undefined,
  brandKey: config.brandKey || undefined,
  modelKey: config.modelKey || undefined,
  bodyTypeKey: config.bodyTypeKey || undefined,
  enabled: Boolean(config.modelKey || config.recordKey),
})
```
