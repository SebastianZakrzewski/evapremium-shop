-- Move checkout orders into evapremium_shop.
-- Data, indexes, RLS, triggers and the payments FK follow the tables.
-- Idempotent: a second run is a no-op once public.orders is gone.

ALTER TABLE IF EXISTS public.order_items SET SCHEMA evapremium_shop;
ALTER TABLE IF EXISTS public.orders SET SCHEMA evapremium_shop;

COMMENT ON TABLE evapremium_shop.payments IS
  'Payment sessions for external providers (Paynow MVP). Linked to evapremium_shop.orders.';

NOTIFY pgrst, 'reload schema';
