# Server-side purchase tracking

Client purchase events still fire on the payment success page. This adds a second send from the Paynow `CONFIRMED` webhook so a paid order is not lost when the browser never loads that page, or when the referrer is `paywall.paynow.pl`.

Both sends are off until the flags below are set on production. Preview (`VERCEL_ENV=preview`), `SANDBOX_ISOLATION=enforce`, and any Paynow payment whose environment is `sandbox` never call GA4 or Google Ads.

## What is stored

Checkout reads first-party click ids and the current cookies, then saves them on `evapremium_shop.orders.purchase_tracking` (nullable JSONB, migration `20261109120000_orders_purchase_tracking.sql`).

- `gclid` / `gbraid` / `wbraid` from the landing URL, kept for 90 days in the `eva_click_ids` cookie and `localStorage`. `_gcl_aw` fills `gclid` when the URL no longer has it.
- GA4 `client_id` from `_ga` (`GA1.1.123.456` → `123.456`). If that cookie is missing, GA4 is skipped. A client id is never invented.
- GA4 `session_id` from `_ga_SGHPWGL4P4` when present.
- Cookie consent at checkout (`statistics`, `marketing`). A missing choice is treated as denied.

## When a paid webhook sends

`transaction_id` matches the browser: `p24OrderId`, otherwise the Paynow `paymentId`, otherwise the order id. Currency is PLN. Value is the order total. Items use the same id, name, price, and quantity as the client purchase.

GA4 Measurement Protocol runs only when `SERVER_TRACKING_ENABLED=true`, statistics consent was granted, and `client_id` was stored.

Google Ads `uploadClickConversions` runs only when `ADS_SERVER_UPLOAD_ENABLED=true` as well, marketing consent was granted, and one click id is stored (`gclid`, then `gbraid`, then `wbraid`). `orderId` is the shop order number (`ORD-...`). `conversionDateTime` is the paid time in Europe/Warsaw. The conversion action is `GOOGLE_ADS_SERVER_CONVERSION_ACTION` on `GOOGLE_ADS_CUSTOMER_ID`. The intended action is the existing secondary action `7861775516` (`Zakup – potwierdzona płatność`) on customer `6142700676`. This does not change the primary client-side Zakup action `AW-18303682173/GGzWCPqk_MscEP2M8JdE`.

`purchase_tracking.ga4.status` and `purchase_tracking.ads.status` become `sent`, `skipped`, or `failed`. A later Paynow retry does not send a channel that is already `sent` or `sending`. A failed channel can be retried by the next `CONFIRMED` notification. Tracking errors are logged and still return HTTP 200 to Paynow.

## Environment variables

| Name | Purpose |
|---|---|
| `SERVER_TRACKING_ENABLED` | `true` turns the server send on. Anything else is off. |
| `ADS_SERVER_UPLOAD_ENABLED` | `true` allows the Ads upload. GA4 can run without it. |
| `GA4_MEASUREMENT_ID` | `G-SGHPWGL4P4` (property 562402558). |
| `GA4_API_SECRET` | Measurement Protocol secret from GA4 Admin → Data streams. |
| `GA4_MP_DEBUG` | `true` adds `debug_mode: 1` so the hit can show in GA4 DebugView. Leave unset in normal production. |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Ads API developer token. |
| `GOOGLE_ADS_OAUTH_CLIENT_ID` | OAuth client id. |
| `GOOGLE_ADS_OAUTH_CLIENT_SECRET` | OAuth client secret. |
| `GOOGLE_ADS_REFRESH_TOKEN` | Refresh token with Ads upload scope. |
| `GOOGLE_ADS_CUSTOMER_ID` | `6142700676`. |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Manager account id, only if the API requires it. |
| `GOOGLE_ADS_SERVER_CONVERSION_ACTION` | `7861775516` or the full resource name. |

Do not set these on Preview. Do not point them at a sandbox Paynow merchant.

## How to verify

1. Apply the migration before enabling the flags. Until the column exists, a send error is logged and Paynow still receives HTTP 200.
2. Place a production-flagged test only after consent, with `gclid` on the landing URL and statistics consent granted. Confirm `purchase_tracking.ga4.status` is `sent` and DebugView shows one purchase when `GA4_MP_DEBUG=true`.
3. With marketing consent and a click id, confirm `ads.status` is `sent`. Use the Google Ads API upload diagnostics / conversion action diagnostics for action `7861775516`. A second webhook for the same payment must not create a second row in `purchase_tracking` send timestamps.
4. In GA4 Admin → Data streams → Configure tag settings → List unwanted referrals, add `paynow.pl` and `paywall.paynow.pl`. That referral exclusion is a GA4 admin change, not something this code does. It stops the client-side purchase from being credited to the Paynow redirect.

## Not done here

No production env vars were changed, no conversion action was edited, and no live GA4 or Ads request is made by the tests.
