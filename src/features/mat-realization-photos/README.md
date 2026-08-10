# Mat realization photos

Zdjęcia z rzeczywistych realizacji dywaników powiązane z
`evapremium_shop.mat_templates` (relacja 1:N).

Każde zdjęcie ma obowiązkowe pole `mat_type`:
- `3d-with-rims` — 3D z rantami
- `classic` — 3D bez rantów

## API

```text
GET /api/mat-realization-photos?recordKey=...&matType=3d-with-rims
GET /api/mat-realization-photos?brandKey=Nissan&modelKey=Qashqai(J12) III gen&matType=classic
```

## Usage (Configurator V2)

Zdjęcia renderują się dopiero po wyborze typu dywanika
(`3d-with-rims` lub `classic`) i są filtrowane po tym typie.

```tsx
const matType = isMatRealizationMatType(config.matType)
  ? config.matType
  : undefined

const { photos } = useMatRealizationPhotos({
  recordKey: config.recordKey || undefined,
  brandKey: config.brandKey || undefined,
  modelKey: config.modelKey || undefined,
  matType,
  enabled: Boolean(matType && (config.modelKey || config.recordKey)),
})
```
