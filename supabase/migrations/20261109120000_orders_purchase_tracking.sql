-- Additive purchase attribution for server-side GA4 and Google Ads.
-- Nullable. Existing orders stay null. No data is copied or updated.
-- Already applied on production: evapremium_shop.orders.purchase_tracking JSONB exists.
-- ADD COLUMN IF NOT EXISTS makes a second apply a no-op.

ALTER TABLE IF EXISTS evapremium_shop.orders
  ADD COLUMN IF NOT EXISTS purchase_tracking JSONB;

COMMENT ON COLUMN evapremium_shop.orders.purchase_tracking IS
  'Click ids, GA client/session ids, consent at checkout, and server-send status. Null until checkout stores attribution.';
