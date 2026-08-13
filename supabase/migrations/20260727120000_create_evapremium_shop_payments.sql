-- Paynow payments table (schema: evapremium_shop)
-- MVP: single payments table with webhook dedupe support

CREATE TABLE IF NOT EXISTS evapremium_shop.payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  provider            TEXT NOT NULL DEFAULT 'paynow',
  environment         TEXT NOT NULL CHECK (environment IN ('sandbox', 'production')),
  external_id         TEXT NOT NULL,
  provider_payment_id TEXT,
  idempotency_key     TEXT NOT NULL,
  amount_minor        INTEGER NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'PLN',
  status              TEXT NOT NULL DEFAULT 'created',
  provider_status     TEXT,
  redirect_url        TEXT,
  buyer_email         TEXT,
  failure_reason      TEXT,
  webhook_dedupe_key  TEXT,
  last_webhook_at     TIMESTAMPTZ,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payments_idempotency_key_unique UNIQUE (idempotency_key),
  CONSTRAINT payments_provider_payment_id_unique UNIQUE (provider, provider_payment_id),
  CONSTRAINT payments_webhook_dedupe_key_unique UNIQUE (webhook_dedupe_key)
);

CREATE INDEX IF NOT EXISTS payments_order_id_idx
  ON evapremium_shop.payments(order_id);

CREATE INDEX IF NOT EXISTS payments_external_id_idx
  ON evapremium_shop.payments(provider, external_id);

CREATE INDEX IF NOT EXISTS payments_status_idx
  ON evapremium_shop.payments(status);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON evapremium_shop.payments
  FOR EACH ROW EXECUTE FUNCTION evapremium_shop.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON evapremium_shop.payments TO postgres, service_role;
GRANT SELECT ON evapremium_shop.payments TO authenticator;

COMMENT ON TABLE evapremium_shop.payments IS
  'Payment sessions for external providers (Paynow MVP). Linked to public.orders.';
