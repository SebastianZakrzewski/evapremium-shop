# MedusaJS Migration - API Contracts and Mapping

## Goal
Define the migration contract between the current Next.js API and the target MedusaJS backend.
This document is the source of truth for endpoint mapping, ownership, and custom modules.

## Current API Surface (Next.js)
Based on `docs/api-backend.md`, `docs/api-endpoints.md`, and `src/app/api/**`.

### Core domains
- Accessories: `/api/accessories`, `/api/accessories/[id]`, `/api/accessories/slug/[slug]`
- Mats: `/api/mats`, `/api/mats/[id]`, `/api/mats/find`, `/api/mats/body-types`, `/api/mats/3d`
- Orders: `/api/orders`, `/api/orders/[orderNumber]`
- Cart: `/api/cart`
- Car data: `/api/car-brands`, `/api/models`, `/api/models/[brand]`, `/api/generations`, `/api/generations/[brand]/[model]`, `/api/body-types`
- Search: `/api/search`
- Mat product images: `/api/mat-product-images`
- Payments (Przelewy24): `/api/payments/p24/*`
- Bitrix24: `/api/bitrix24/*`, `/api/bitrix/order`
- Abandoned carts: `/api/abandoned-carts/*`

## Target MedusaJS Ownership
Legend:
- **core**: Medusa core module
- **custom**: custom module or API route in Medusa
- **adapter**: temporary compatibility endpoint in Next.js

| Current Endpoint | Target Medusa API | Owner | Notes |
|---|---|---|---|
| `/api/accessories` | `Store Products` + `Collections` | core | Map accessories to product types/collections. |
| `/api/accessories/[id]` | `Store Product` | core | |
| `/api/accessories/slug/[slug]` | `Store Product` with handle | core | Use handle in Medusa. |
| `/api/mats` | `Store Products` | core + custom | Mats are configurable products with pricing rules. |
| `/api/mats/[id]` | `Store Product` | core | |
| `/api/mats/find` | `Custom configurator route` | custom | Returns best match for car config. |
| `/api/mats/body-types` | `Custom configurator route` | custom | Should use car catalog module. |
| `/api/mats/3d` | `Custom configurator route` | custom | For dynamic preview assets if kept server-side. |
| `/api/orders` | `Store Orders` / `Admin Orders` | core | Create order from cart. |
| `/api/orders/[orderNumber]` | `Store Order` | core | Use order reference. |
| `/api/cart` | `Store Cart` | core | Map actions to cart endpoints. |
| `/api/car-brands` | `Car catalog module` | custom | New Medusa module or separate service. |
| `/api/models` | `Car catalog module` | custom | |
| `/api/models/[brand]` | `Car catalog module` | custom | |
| `/api/generations` | `Car catalog module` | custom | |
| `/api/generations/[brand]/[model]` | `Car catalog module` | custom | |
| `/api/body-types` | `Car catalog module` | custom | |
| `/api/search` | `Search module` | custom | Optional, can proxy to Medusa + car catalog. |
| `/api/mat-product-images` | `Car catalog module` | custom | Store per model/variant images. |
| `/api/payments/p24/*` | `Payment provider` | custom | Medusa payment integration for Przelewy24. |
| `/api/bitrix24/*` | `Integration module` | custom | Webhook/outbound sync. |
| `/api/abandoned-carts/*` | `Workflow + events` | custom | Can be Medusa workflow + scheduled job. |

## API Contract Principles
- Maintain backwards-compatible response shapes during migration (via adapter).
- Use Medusa Store API for customer flows and Admin API for operational tasks.
- Keep custom EVA logic in Medusa modules, not in Next.js UI.

## Compatibility Layer (Next.js)
During migration, `src/app/api/*` will proxy or adapt responses to Medusa:
- Phase 1: proxy read endpoints (products, car catalog)
- Phase 2: proxy write endpoints (cart, orders)
- Phase 3: remove old handlers

## Open Questions for Later Phases
- How to model configurator rules in Medusa pricing engine.
- Whether to store car catalog in Medusa or as separate microservice.
- Source of truth for mat images (Medusa file service vs external storage).

