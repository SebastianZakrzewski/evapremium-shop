-- Additive purchase attribution for server-side GA4 and Google Ads.
-- Nullable. Existing orders stay null. No data is copied or updated.

ALTER TABLE IF EXISTS evapremium_shop.orders
  ADD COLUMN IF NOT EXISTS purchase_tracking JSONB;

COMMENT ON COLUMN evapremium_shop.orders.purchase_tracking IS
  'Click ids, GA client/session ids, consent at checkout, and server-send status. Null until checkout stores attribution.';
