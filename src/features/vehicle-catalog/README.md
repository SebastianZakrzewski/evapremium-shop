# Vehicle catalog

Server-side vehicle catalog backed exclusively by
`evapremium_shop.mat_templates`.

## API

```text
GET /api/vehicle-catalog
GET /api/vehicle-catalog?brandKey=ford
GET /api/vehicle-catalog?brandKey=ford&modelFamilyKey=ranger&year=2024
```

Pricing is always resolved on the server:

```json
POST /api/pricing/resolve
{
  "recordKey": "pickup|ford|ranger_6_gen|2022-2028|pickup|876",
  "year": 2024,
  "bodyTypeKey": "pickup",
  "matType": "3d-with-rims",
  "variantKey": "basic"
}
```

`bodyTypeKey` never determines the pricing segment. The template category,
category aliases and template-specific overrides are resolved in that order.

## Data sync

```text
node scripts/extract-evamats-templates.mjs
node scripts/seed-mat-templates-rest.mjs
node scripts/sync-pricing-catalog-rest.mjs
```

Sync scripts use environment variables from `.env` and send records in bulk
packages. They do not seed individual rows through MCP.
