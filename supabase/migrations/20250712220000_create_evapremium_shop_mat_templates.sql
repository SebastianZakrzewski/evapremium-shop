-- EVAMATS mat templates (schema: evapremium_shop)
-- Source: NEW Baza szablonów Evamats (2).xlsx → output/evamats-templates-compact.json
-- Design: single table mat_templates (no mat_template_catalogs — incremental INSERT + record_key UNIQUE)
-- DO NOT APPLY until validated — review column mapping vs normalized JSON v1.4.0

CREATE SCHEMA IF NOT EXISTS evapremium_shop;

CREATE TABLE IF NOT EXISTS evapremium_shop.mat_templates (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Pricing category (Cennik dla handlowca)
  dealer_pricing_category         TEXT NOT NULL,
  dealer_pricing_category_key     TEXT NOT NULL,
  dealer_pricing_category_source  TEXT,

  -- Vehicle identity
  brand_name                      TEXT NOT NULL,
  brand_key                       TEXT NOT NULL,
  model_name                      TEXT NOT NULL,
  model_key                       TEXT NOT NULL,

  -- Generation / years (GENERACJA AUTA)
  generation                      TEXT,
  year_from                       SMALLINT CHECK (year_from IS NULL OR year_from BETWEEN 1900 AND 2100),
  year_to                         SMALLINT CHECK (year_to IS NULL OR year_to BETWEEN 1900 AND 2100),
  is_open_ended                   BOOLEAN NOT NULL DEFAULT false,

  -- Body types (Typ nadwozia1/2/3)
  body_type_1                     TEXT,
  body_type_2                     TEXT,
  body_type_3                     TEXT,
  body_type_1_key                 TEXT,
  body_type_2_key                 TEXT,
  body_type_3_key                 TEXT,
  body_type                       TEXT,
  body_type_key                   TEXT,
  body_type_variants              TEXT[] NOT NULL DEFAULT '{}',

  -- Stable business key from JSON (record_key)
  record_key                      TEXT NOT NULL,

  -- Import provenance
  source_file                     TEXT,
  source_sheet                    TEXT,
  source_row_id                   INTEGER,
  json_version                    TEXT NOT NULL DEFAULT '1.4.0',

  is_active                       BOOLEAN NOT NULL DEFAULT true,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT mat_templates_record_key_unique UNIQUE (record_key),
  CONSTRAINT mat_templates_year_range_check CHECK (
    year_from IS NULL
    OR year_to IS NULL
    OR year_from <= year_to
  )
);

CREATE INDEX mat_templates_brand_model_idx
  ON evapremium_shop.mat_templates (brand_key, model_key);

CREATE INDEX mat_templates_brand_model_generation_idx
  ON evapremium_shop.mat_templates (brand_name, model_name, generation);

CREATE INDEX mat_templates_pricing_category_key_idx
  ON evapremium_shop.mat_templates (dealer_pricing_category_key);

CREATE INDEX mat_templates_body_type_key_idx
  ON evapremium_shop.mat_templates (body_type_key)
  WHERE body_type_key IS NOT NULL;

CREATE INDEX mat_templates_body_type_variants_gin_idx
  ON evapremium_shop.mat_templates USING GIN (body_type_variants);

CREATE TRIGGER mat_templates_updated_at
  BEFORE UPDATE ON evapremium_shop.mat_templates
  FOR EACH ROW EXECUTE FUNCTION evapremium_shop.set_updated_at();

COMMENT ON TABLE evapremium_shop.mat_templates IS
  'Normalized EVAMATS template rows mapped from evamats-templates JSON.';

COMMENT ON COLUMN evapremium_shop.mat_templates.dealer_pricing_category IS
  'JSON: dealer_pricing_category — human-readable category label (lowercase, underscores).';

COMMENT ON COLUMN evapremium_shop.mat_templates.dealer_pricing_category_key IS
  'JSON: dealer_pricing_category_key — stable category slug, e.g. passenger_car.';

COMMENT ON COLUMN evapremium_shop.mat_templates.dealer_pricing_category_source IS
  'JSON: dealer_pricing_category_source — translated source label from Excel.';

COMMENT ON COLUMN evapremium_shop.mat_templates.generation IS
  'JSON: generation — generation label, e.g. 2006-2013 or 2024+.';

COMMENT ON COLUMN evapremium_shop.mat_templates.body_type_variants IS
  'JSON: body_type_variants — array of non-null body type labels.';

COMMENT ON COLUMN evapremium_shop.mat_templates.record_key IS
  'JSON: record_key — unique composite key: category|brand|model|generation.';

ALTER TABLE evapremium_shop.mat_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY mat_templates_service_role
  ON evapremium_shop.mat_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY mat_templates_read_authenticated
  ON evapremium_shop.mat_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

NOTIFY pgrst, 'reload schema';
