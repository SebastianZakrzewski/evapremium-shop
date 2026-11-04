# GA4

Loads measurement id `G-SGHPWGL4P4` on every page. Override with `NEXT_PUBLIC_GA_ID`.

Consent Mode v2 follows Cookiebot (`statistics` → `analytics_storage`, `marketing` → ad signals). The third-party GTM container `GTM-TD2WDGKV` is unchanged. Both tags share `dataLayer` without resetting it.

Ecommerce events are sent from the existing tracking helpers: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`. `generate_lead` fires when the contact form reports success. `purchase` is stored under `ga4_purchase_<transaction_id>` so a refresh does not send it again.

SPA route changes are not given a manual `page_view`. GA4 enhanced measurement records history changes.
