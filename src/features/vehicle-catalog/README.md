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

Passenger configurator sets and list prices come from the shop catalog
(`output/evamats-brand-model-variants.json`), joined 1:1 onto
`mat_templates.record_key` into `src/data/shop-template-offers.json`.

- Rebuild: `npm run build:shop-template-offers`
- Eva Premium after-discount uses the active catalog rates (and matrix
  `discount_excluded` when the shop list price matches the matrix base)
- Templates without a shop join keep the previous category matrix + `seat_rows` allowlist

Pickup dual-mat sets follow the shop product when a join exists.

## Data sync

```text
node scripts/extract-evamats-templates.mjs
node scripts/seed-mat-templates-rest.mjs
node scripts/sync-pricing-catalog-rest.mjs
npx tsx scripts/build-shop-template-offers.ts
```

Sync scripts use environment variables from `.env` and send records in bulk
packages. They do not seed individual rows through MCP.
