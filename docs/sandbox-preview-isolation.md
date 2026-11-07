# Preview sandbox isolation

This does not provision a database or change Vercel. It is the checklist for a later, authenticated setup. Do not point these values at production, and do not copy the production service-role key.

The shop fails closed on `VERCEL_ENV=preview` and when `SANDBOX_ISOLATION=enforce`. `VERCEL_ENV=production` ignores sandbox flags and keeps the current production payment, CRM, cron, and analytics behavior.

## Prerequisites

1. Create a new empty Supabase project. Do not restore or clone production. The project ref must not be `kmepxyervpeujwvgdqtm`.
2. Apply `supabase/migrations` to that project, then run `supabase/seed/sandbox_synthetic.sql` only there. The seed is one fake pending order for `sandbox.synthetic@example.com`.
3. In the Paynow sandbox merchant (not the production merchant), set the return URL and notification URL to this Preview host only, for example `https://<preview-host>/payment/success` and `https://<preview-host>/api/payments/paynow/webhook`.
4. Set Preview environment variables. Leave production variables unchanged.

## Preview variables

| Name | Required value |
|---|---|
| `SANDBOX_SUPABASE_PROJECT_REF` | The new project ref |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<that-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key of the new project |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role of the new project |
| `PAYNOW_ENABLED` | `true` |
| `PAYNOW_ENVIRONMENT` | `sandbox` (must be explicit; an empty value is rejected) |
| `PAYNOW_API_KEY` / `PAYNOW_SIGNATURE_KEY` | Sandbox merchant keys |
| `PAYNOW_RETURN_URL` | `https://<preview-host>/payment/success` |
| `PAYNOW_NOTIFICATION_URL` | `https://<preview-host>/api/payments/paynow/webhook` |
| `SANDBOX_PUBLIC_HOST` | `<preview-host>` if it differs from `VERCEL_URL` |
| `BITRIX24_WEBHOOK_ENABLED` | unset or not `true` |
| `BITRIX24_WEBHOOK_URL` | unset |
| `BITRIX24_AUTO_SYNC_ORDERS` / `BITRIX24_AUTO_SYNC_LEADS` | unset or not `true` |
| `P24_ENABLED` | unset or not `true` |

`NEXT_PUBLIC_VERCEL_ENV` and `NEXT_PUBLIC_SANDBOX_ISOLATION` are inlined from `VERCEL_ENV` and `SANDBOX_ISOLATION` at build time. Do not set them to production values on Preview.

## What the sandbox runtime refuses

- Supabase host other than `<SANDBOX_SUPABASE_PROJECT_REF>.supabase.co`, including the known production host
- Paynow production API, production shop return/notification hosts, or a missing explicit `PAYNOW_ENVIRONMENT=sandbox`
- Bitrix calls, abandoned-cart CRM export, and the daily cron export
- P24 register and callback
- GTM `GTM-TD2WDGKV`, GA4 `gtag.js`, Google Ads config, Meta pixel init, and Microsoft Clarity

Purchase tracking still runs, once per order, into `window.__sandboxTracking` only. It does not call `gtag` and does not load the live tags. Production builds do not use that sink.

A misconfigured Preview responds `503` with violation codes and does not write orders, payments, or carts.

## Still manual

Creating the Supabase project, applying migrations, seeding, and saving the Preview env vars requires an authenticated operator. This repository change does not do those steps and does not deploy.
