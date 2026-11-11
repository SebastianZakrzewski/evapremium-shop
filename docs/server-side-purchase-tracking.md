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

Google Ads runs only when `ADS_SERVER_UPLOAD_ENABLED=true` as well, marketing consent was granted, and one click id is stored (`gclid`, then `gbraid`, then `wbraid`). The call is `POST https://datamanager.googleapis.com/v1/events:ingest` (Data Manager API, offline click conversions). Google rejects `ConversionUploadService.UploadClickConversions` for this Cloud project: stored failures on ORD-2026-000536, ORD-2026-000540, and ORD-2026-000541 say new integrations must use the Data Manager API. A developer token is not sent and does not authorize this call.

The destination operating account is `GOOGLE_ADS_CUSTOMER_ID` (`6142700676`). `productDestinationId` is the numeric `GOOGLE_ADS_SERVER_CONVERSION_ACTION` (`7896361865`). That action must be type `UPLOAD_CLICKS` (Google Ads UI source: Website → Import from clicks). `loginAccount` is sent only when `GOOGLE_ADS_LOGIN_CUSTOMER_ID` is set, and then it must be a manager account that contains `6142700676` and that the OAuth user belongs to. The event sends `eventSource=WEB`, `currency=PLN`, the order total, the paid time as RFC 3339 in Europe/Warsaw, the click id, and `transactionId` = the shop order number (`ORD-...`). Google deduplicates retries with that `transactionId` inside the conversion action. `consent.adUserData` is `CONSENT_GRANTED` because the upload runs only after marketing consent. `adPersonalization` is not sent. No email, phone, or other user data is sent. This does not change the client-side Zakup action `AW-18303682173/GGzWCPqk_MscEP2M8JdE`.

Each Google call aborts after 8 seconds. A failure is stored on `purchase_tracking.ads.reason` and the Paynow webhook still returns HTTP 200. A success stores `purchase_tracking.ads.requestId`.

`purchase_tracking.ga4.status` and `purchase_tracking.ads.status` become `sent`, `skipped`, or `failed`. A later Paynow retry does not send a channel that is already `sent` or `sending`. A failed channel can be retried by the next `CONFIRMED` notification. Orders without marketing consent stay `skipped` and are not uploaded.

## Backfill

`npx tsx scripts/backfill-ads-conversions.ts` lists paid orders created in the last 90 days that have marketing consent, a `gclid`, and `ads.status` of `failed` or `pending`. It does not upload. Add `--send` to upload those orders through the same client. `--send` does not call GA4 again and refuses to run when server tracking is blocked or `ADS_SERVER_UPLOAD_ENABLED` is not `true`. Conversion time is the payment `paid_at`, or the order `updated_at` when that is missing. Run it only after the Data Manager scope and API enablement below are in place.

## Environment variables

| Name | Purpose |
|---|---|
| `SERVER_TRACKING_ENABLED` | `true` turns the server send on. Anything else is off. |
| `ADS_SERVER_UPLOAD_ENABLED` | `true` allows the Ads upload. GA4 can run without it. |
| `GA4_MEASUREMENT_ID` | `G-SGHPWGL4P4` (property 562402558). |
| `GA4_API_SECRET` | Measurement Protocol secret from GA4 Admin → Data streams. |
| `GA4_MP_DEBUG` | `true` adds `debug_mode: 1` so the hit can show in GA4 DebugView. Leave unset in normal production. |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Unused. Data Manager does not accept a developer token. Leave it unset. |
| `GOOGLE_ADS_OAUTH_CLIENT_ID` | OAuth client id from Cloud project `evapremium-ads`. |
| `GOOGLE_ADS_OAUTH_CLIENT_SECRET` | OAuth client secret. |
| `GOOGLE_ADS_REFRESH_TOKEN` | Refresh token that includes `https://www.googleapis.com/auth/datamanager`. An older token that only has `https://www.googleapis.com/auth/adwords` cannot call Data Manager. |
| `GOOGLE_ADS_CUSTOMER_ID` | Operating account `6142700676`. Hyphens are stripped. |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Optional. Set only when the OAuth user reaches `6142700676` through a manager account. Leave unset for a direct user of `6142700676`. |
| `GOOGLE_ADS_SERVER_CONVERSION_ACTION` | Numeric id `7896361865` (or the resource name; only the trailing id is sent). The action must be `UPLOAD_CLICKS`. |

Do not set these on Preview. Do not point them at a sandbox Paynow merchant.

## One-time Google setup

Do this in Cloud project `evapremium-ads` before turning the upload on. The existing Ads refresh token does not include the Data Manager scope.

1. Enable the Data Manager API (`datamanager.googleapis.com`) on project `evapremium-ads`.
2. On the OAuth consent screen, open Data Access and add `https://www.googleapis.com/auth/datamanager`. Do not add `https://www.googleapis.com/auth/datamanager.partnerlink`. Save.
3. If the app is External and in Testing, add the Google account that has access to Ads customer `6142700676` as a test user. If the app is In production, granting a new sensitive scope can require Google’s OAuth verification before that account can consent. That consent screen is a manual step.
4. Sign in as that Ads user and mint a new refresh token with scope `https://www.googleapis.com/auth/datamanager` (and `https://www.googleapis.com/auth/adwords` if the same token is still used elsewhere). Replace `GOOGLE_ADS_REFRESH_TOKEN` in Vercel production. Do not commit the token.
5. The same Google user must be a user on customer `6142700676`, or a user on a manager account that contains it. In the manager case set `GOOGLE_ADS_LOGIN_CUSTOMER_ID` to that manager’s 10-digit id. Otherwise leave it unset. The operating account stays `6142700676`.
6. Confirm conversion action `7896361865` on that customer is type Upload clicks (`UPLOAD_CLICKS`). Data Manager rejects a website-tag (`WEBPAGE`) action for this offline ingest.

## How to verify

1. Apply the migration before enabling the flags. Until the column exists, a send error is logged and Paynow still receives HTTP 200.
2. Place a production-flagged test only after consent, with `gclid` on the landing URL and statistics consent granted. Confirm `purchase_tracking.ga4.status` is `sent` and DebugView shows one purchase when `GA4_MP_DEBUG=true`.
3. With marketing consent and a click id, confirm `ads.status` is `sent` and `ads.requestId` is set. In Google Ads, open conversion action `7896361865` and confirm the upload. A second webhook for the same payment must not call Data Manager again.
4. In GA4 Admin → Data streams → Configure tag settings → List unwanted referrals, add `paynow.pl` and `paywall.paynow.pl`. That referral exclusion is a GA4 admin change, not something this code does. It stops the client-side purchase from being credited to the Paynow redirect.

## Not done here

No production env vars were changed, no conversion action was edited, and no live GA4 or Ads request is made by the tests.
