-- Synthetic sandbox seed. Do not run this against production.
-- Apply only after the existing supabase/migrations have been applied
-- to an empty sandbox project whose ref is NOT kmepxyervpeujwvgdqtm.
--
-- This row is not a customer. Email is example.com. No payment, CRM, or message is created.

INSERT INTO evapremium_shop.orders (
  order_number,
  status,
  payment_status,
  payment_method,
  customer,
  shipping_address,
  subtotal,
  shipping_cost,
  tax,
  discount,
  total,
  notes
) VALUES (
  'ORD-SANDBOX-000001',
  'pending',
  'pending',
  'paynow',
  '{"name":"Sandbox Synthetic","email":"sandbox.synthetic@example.com","phone":"000000000"}'::jsonb,
  '{"street":"Synthetic 1","city":"Sandbox","postalCode":"00-000","country":"PL"}'::jsonb,
  1,
  0,
  0,
  0,
  1,
  'Synthetic sandbox seed. Not a customer order.'
)
ON CONFLICT (order_number) DO NOTHING;
