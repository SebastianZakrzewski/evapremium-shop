-- EVAMATS configurator pricing (schema: evapremium_shop)
-- Source: CENNIK EVAMATS.xlsx — Cennik 20%/30%

CREATE SCHEMA IF NOT EXISTS evapremium_shop;

GRANT USAGE ON SCHEMA evapremium_shop TO postgres, service_role, anon, authenticated, authenticator, supabase_admin;
GRANT ALL ON ALL TABLES IN SCHEMA evapremium_shop TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA evapremium_shop TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA evapremium_shop TO authenticator;

ALTER DEFAULT PRIVILEGES IN SCHEMA evapremium_shop
  GRANT ALL ON TABLES TO postgres, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA evapremium_shop
  GRANT SELECT ON TABLES TO authenticator;

CREATE OR REPLACE FUNCTION evapremium_shop.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Catalog versions
CREATE TABLE evapremium_shop.pricing_catalog_versions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                    TEXT NOT NULL UNIQUE,
  name                    TEXT NOT NULL,
  source_file             TEXT,
  discount_threshold_pln  NUMERIC(10,2) NOT NULL DEFAULT 910,
  discount_rate_below     NUMERIC(5,4) NOT NULL DEFAULT 0.2000,
  discount_rate_from      NUMERIC(5,4) NOT NULL DEFAULT 0.3000,
  deposit_rules           TEXT,
  is_active               BOOLEAN NOT NULL DEFAULT false,
  valid_from              DATE,
  valid_to                DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX pricing_catalog_versions_one_active_idx
  ON evapremium_shop.pricing_catalog_versions (is_active)
  WHERE is_active = true;

CREATE TRIGGER pricing_catalog_versions_updated_at
  BEFORE UPDATE ON evapremium_shop.pricing_catalog_versions
  FOR EACH ROW EXECUTE FUNCTION evapremium_shop.set_updated_at();

-- 2. Vehicle categories
CREATE TABLE evapremium_shop.pricing_vehicle_categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT NOT NULL UNIQUE,
  label          TEXT NOT NULL,
  pricing_model  TEXT NOT NULL CHECK (pricing_model IN ('dual_mat_type', 'single_price')),
  sort_order     SMALLINT NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Variants dictionary
CREATE TABLE evapremium_shop.pricing_variants (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_key         TEXT NOT NULL UNIQUE,
  variant_label       TEXT NOT NULL,
  configurator_slug   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX pricing_variants_configurator_slug_idx
  ON evapremium_shop.pricing_variants (configurator_slug)
  WHERE configurator_slug IS NOT NULL;

-- 4. Category ↔ variant (configurator UI)
CREATE TABLE evapremium_shop.pricing_category_variants (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_category_id UUID NOT NULL REFERENCES evapremium_shop.pricing_vehicle_categories(id) ON DELETE CASCADE,
  variant_id          UUID NOT NULL REFERENCES evapremium_shop.pricing_variants(id) ON DELETE CASCADE,
  is_default          BOOLEAN NOT NULL DEFAULT false,
  sort_order          SMALLINT NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (vehicle_category_id, variant_id)
);

-- 5. Price matrix
CREATE TABLE evapremium_shop.pricing_matrix (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_version_id        UUID NOT NULL REFERENCES evapremium_shop.pricing_catalog_versions(id) ON DELETE CASCADE,
  vehicle_category_id       UUID NOT NULL REFERENCES evapremium_shop.pricing_vehicle_categories(id) ON DELETE CASCADE,
  variant_id                UUID NOT NULL REFERENCES evapremium_shop.pricing_variants(id) ON DELETE CASCADE,
  mat_type                  TEXT NOT NULL CHECK (mat_type IN ('classic', '3d-with-rims', 'single')),
  base_price_pln            NUMERIC(10,2) NOT NULL CHECK (base_price_pln >= 0),
  price_after_discount_pln  NUMERIC(10,2) CHECK (price_after_discount_pln >= 0),
  discount_excluded         BOOLEAN NOT NULL DEFAULT false,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (catalog_version_id, vehicle_category_id, variant_id, mat_type)
);

CREATE INDEX pricing_matrix_lookup_idx
  ON evapremium_shop.pricing_matrix (catalog_version_id, vehicle_category_id, variant_id, mat_type);

CREATE TRIGGER pricing_matrix_updated_at
  BEFORE UPDATE ON evapremium_shop.pricing_matrix
  FOR EACH ROW EXECUTE FUNCTION evapremium_shop.set_updated_at();

-- 6. Model → category rules
CREATE TABLE evapremium_shop.pricing_model_rules (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_version_id  UUID NOT NULL REFERENCES evapremium_shop.pricing_catalog_versions(id) ON DELETE CASCADE,
  model_key           TEXT NOT NULL,
  model_label         TEXT NOT NULL,
  vehicle_category_id UUID REFERENCES evapremium_shop.pricing_vehicle_categories(id),
  pricing_mode        TEXT NOT NULL DEFAULT 'matrix' CHECK (pricing_mode IN ('matrix', 'individual')),
  notes               TEXT,
  brand_name          TEXT,
  model_name          TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (catalog_version_id, model_key)
);

CREATE INDEX pricing_model_rules_label_idx
  ON evapremium_shop.pricing_model_rules (model_label);

CREATE INDEX pricing_model_rules_brand_model_idx
  ON evapremium_shop.pricing_model_rules (brand_name, model_name)
  WHERE brand_name IS NOT NULL;

-- 7. Extras (shipping, tunnel, etc.)
CREATE TABLE evapremium_shop.pricing_extras (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_version_id  UUID NOT NULL REFERENCES evapremium_shop.pricing_catalog_versions(id) ON DELETE CASCADE,
  slug                TEXT NOT NULL,
  label               TEXT NOT NULL,
  price_pln           NUMERIC(10,2),
  price_raw           TEXT,
  discount_excluded   BOOLEAN NOT NULL DEFAULT true,
  sort_order          SMALLINT NOT NULL DEFAULT 0,
  UNIQUE (catalog_version_id, slug)
);

-- RLS: service_role bypasses; block anon/authenticated direct access
ALTER TABLE evapremium_shop.pricing_catalog_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_category_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_model_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY pricing_catalog_versions_service_role
  ON evapremium_shop.pricing_catalog_versions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY pricing_vehicle_categories_service_role
  ON evapremium_shop.pricing_vehicle_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY pricing_variants_service_role
  ON evapremium_shop.pricing_variants FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY pricing_category_variants_service_role
  ON evapremium_shop.pricing_category_variants FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY pricing_matrix_service_role
  ON evapremium_shop.pricing_matrix FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY pricing_model_rules_service_role
  ON evapremium_shop.pricing_model_rules FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY pricing_extras_service_role
  ON evapremium_shop.pricing_extras FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Read-only for authenticated (optional API via server)
CREATE POLICY pricing_catalog_versions_read_authenticated
  ON evapremium_shop.pricing_catalog_versions FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY pricing_vehicle_categories_read_authenticated
  ON evapremium_shop.pricing_vehicle_categories FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY pricing_variants_read_authenticated
  ON evapremium_shop.pricing_variants FOR SELECT TO authenticated USING (true);

CREATE POLICY pricing_category_variants_read_authenticated
  ON evapremium_shop.pricing_category_variants FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY pricing_matrix_read_authenticated
  ON evapremium_shop.pricing_matrix FOR SELECT TO authenticated USING (true);

CREATE POLICY pricing_model_rules_read_authenticated
  ON evapremium_shop.pricing_model_rules FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY pricing_extras_read_authenticated
  ON evapremium_shop.pricing_extras FOR SELECT TO authenticated USING (true);

NOTIFY pgrst, 'reload schema';
