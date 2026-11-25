-- Omnibus price history. Not applied to production.
-- Run only after an explicit consent. It records future selling-price changes.
-- It does not invent a 30-day price for reductions that were never stored.

CREATE TABLE evapremium_shop.price_history (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_version_id  UUID NOT NULL REFERENCES evapremium_shop.pricing_catalog_versions(id) ON DELETE CASCADE,
  vehicle_category_id UUID NOT NULL REFERENCES evapremium_shop.pricing_vehicle_categories(id) ON DELETE CASCADE,
  variant_id          UUID NOT NULL REFERENCES evapremium_shop.pricing_variants(id) ON DELETE CASCADE,
  mat_type            TEXT NOT NULL,
  price_pln           NUMERIC(10,2) NOT NULL CHECK (price_pln >= 0),
  price_kind          TEXT NOT NULL CHECK (price_kind IN ('listed_selling', 'reference')),
  effective_at        TIMESTAMPTZ NOT NULL,
  source              TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX price_history_lookup_idx
  ON evapremium_shop.price_history (
    catalog_version_id,
    vehicle_category_id,
    variant_id,
    mat_type,
    price_kind,
    effective_at
  );

ALTER TABLE evapremium_shop.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY price_history_service_role
  ON evapremium_shop.price_history
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION evapremium_shop.record_pricing_matrix_price()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  selling NUMERIC(10,2);
BEGIN
  selling := CASE
    WHEN NEW.discount_excluded OR NEW.price_after_discount_pln IS NULL THEN NEW.base_price_pln
    ELSE NEW.price_after_discount_pln
  END;

  INSERT INTO evapremium_shop.price_history (
    catalog_version_id,
    vehicle_category_id,
    variant_id,
    mat_type,
    price_pln,
    price_kind,
    effective_at,
    source
  ) VALUES (
    NEW.catalog_version_id,
    NEW.vehicle_category_id,
    NEW.variant_id,
    NEW.mat_type,
    selling,
    'listed_selling',
    COALESCE(NEW.updated_at, now()),
    'pricing_matrix'
  );

  IF NEW.base_price_pln IS DISTINCT FROM selling THEN
    INSERT INTO evapremium_shop.price_history (
      catalog_version_id,
      vehicle_category_id,
      variant_id,
      mat_type,
      price_pln,
      price_kind,
      effective_at,
      source
    ) VALUES (
      NEW.catalog_version_id,
      NEW.vehicle_category_id,
      NEW.variant_id,
      NEW.mat_type,
      NEW.base_price_pln,
      'reference',
      COALESCE(NEW.updated_at, now()),
      'pricing_matrix'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER pricing_matrix_price_history
  AFTER INSERT OR UPDATE OF base_price_pln, price_after_discount_pln, discount_excluded
  ON evapremium_shop.pricing_matrix
  FOR EACH ROW
  EXECUTE FUNCTION evapremium_shop.record_pricing_matrix_price();

NOTIFY pgrst, 'reload schema';
