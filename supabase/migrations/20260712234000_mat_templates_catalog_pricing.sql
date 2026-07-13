CREATE SCHEMA IF NOT EXISTS evapremium_shop;

ALTER TABLE evapremium_shop.mat_templates
  ADD COLUMN IF NOT EXISTS model_family_name TEXT,
  ADD COLUMN IF NOT EXISTS model_family_key TEXT;

UPDATE evapremium_shop.mat_templates
SET
  model_family_key = COALESCE(
    model_family_key,
    regexp_replace(model_key, '_(?:[0-9]+|[ivxlcdm]+)_gen(?:_.*)?$', '', 'i')
  ),
  model_family_name = COALESCE(
    model_family_name,
    initcap(replace(
      regexp_replace(model_key, '_(?:[0-9]+|[ivxlcdm]+)_gen(?:_.*)?$', '', 'i'),
      '_',
      ' '
    ))
  );

ALTER TABLE evapremium_shop.mat_templates
  ALTER COLUMN model_family_name SET NOT NULL,
  ALTER COLUMN model_family_key SET NOT NULL;

CREATE INDEX IF NOT EXISTS mat_templates_catalog_lookup_idx
  ON evapremium_shop.mat_templates (
    is_active,
    dealer_pricing_category_key,
    brand_key,
    model_family_key,
    year_from,
    year_to
  );

CREATE TABLE IF NOT EXISTS evapremium_shop.pricing_catalog_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  source_file TEXT,
  discount_threshold_pln NUMERIC(10,2) NOT NULL DEFAULT 910,
  discount_rate_below NUMERIC(5,4) NOT NULL DEFAULT 0.20,
  discount_rate_from NUMERIC(5,4) NOT NULL DEFAULT 0.30,
  is_active BOOLEAN NOT NULL DEFAULT false,
  valid_from DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS pricing_catalog_one_active_idx
  ON evapremium_shop.pricing_catalog_versions (is_active)
  WHERE is_active;

CREATE TABLE IF NOT EXISTS evapremium_shop.pricing_vehicle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('dual_mat_type', 'single_price')),
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evapremium_shop.pricing_category_aliases (
  alias_slug TEXT PRIMARY KEY,
  vehicle_category_id UUID NOT NULL
    REFERENCES evapremium_shop.pricing_vehicle_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evapremium_shop.pricing_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_key TEXT NOT NULL UNIQUE,
  variant_label TEXT NOT NULL,
  configurator_slug TEXT,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evapremium_shop.pricing_category_variants (
  vehicle_category_id UUID NOT NULL
    REFERENCES evapremium_shop.pricing_vehicle_categories(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL
    REFERENCES evapremium_shop.pricing_variants(id) ON DELETE CASCADE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (vehicle_category_id, variant_id)
);

CREATE TABLE IF NOT EXISTS evapremium_shop.pricing_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_version_id UUID NOT NULL
    REFERENCES evapremium_shop.pricing_catalog_versions(id) ON DELETE CASCADE,
  vehicle_category_id UUID NOT NULL
    REFERENCES evapremium_shop.pricing_vehicle_categories(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL
    REFERENCES evapremium_shop.pricing_variants(id) ON DELETE CASCADE,
  mat_type TEXT NOT NULL CHECK (mat_type IN ('classic', '3d-with-rims', 'single')),
  base_price_pln NUMERIC(10,2) NOT NULL CHECK (base_price_pln >= 0),
  price_after_discount_pln NUMERIC(10,2) CHECK (price_after_discount_pln >= 0),
  discount_excluded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (catalog_version_id, vehicle_category_id, variant_id, mat_type)
);

CREATE INDEX IF NOT EXISTS pricing_matrix_lookup_idx
  ON evapremium_shop.pricing_matrix (
    catalog_version_id,
    vehicle_category_id,
    variant_id,
    mat_type
  );

CREATE TABLE IF NOT EXISTS evapremium_shop.pricing_template_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_version_id UUID NOT NULL
    REFERENCES evapremium_shop.pricing_catalog_versions(id) ON DELETE CASCADE,
  template_record_key TEXT
    REFERENCES evapremium_shop.mat_templates(record_key) ON DELETE CASCADE,
  brand_key TEXT,
  model_family_key TEXT,
  year_from SMALLINT,
  year_to SMALLINT,
  variant_key TEXT NOT NULL,
  override_category_slug TEXT,
  fixed_base_price_pln NUMERIC(10,2),
  surcharge_pln NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    template_record_key IS NOT NULL
    OR (brand_key IS NOT NULL AND model_family_key IS NOT NULL)
  ),
  CHECK (year_from IS NULL OR year_to IS NULL OR year_from <= year_to),
  CHECK (
    override_category_slug IS NOT NULL
    OR fixed_base_price_pln IS NOT NULL
    OR surcharge_pln <> 0
  )
);

CREATE INDEX IF NOT EXISTS pricing_template_overrides_lookup_idx
  ON evapremium_shop.pricing_template_overrides (
    catalog_version_id,
    template_record_key,
    brand_key,
    model_family_key,
    variant_key
  )
  WHERE is_active;

CREATE TABLE IF NOT EXISTS evapremium_shop.pricing_bitrix_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_category_id UUID NOT NULL
    REFERENCES evapremium_shop.pricing_vehicle_categories(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL
    REFERENCES evapremium_shop.pricing_variants(id) ON DELETE CASCADE,
  bitrix_field TEXT NOT NULL DEFAULT 'UF_CRM_1757024931236',
  bitrix_label TEXT NOT NULL,
  bitrix_enum_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vehicle_category_id, variant_id, bitrix_field)
);

CREATE TABLE IF NOT EXISTS evapremium_shop.pricing_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_version_id UUID NOT NULL
    REFERENCES evapremium_shop.pricing_catalog_versions(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  extra_type TEXT NOT NULL DEFAULT 'other'
    CHECK (extra_type IN ('shipping', 'surcharge', 'deposit', 'other')),
  price_pln NUMERIC(10,2),
  price_raw TEXT,
  discount_excluded BOOLEAN NOT NULL DEFAULT true,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  UNIQUE (catalog_version_id, slug)
);

ALTER TABLE evapremium_shop.pricing_catalog_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_category_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_category_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_template_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_bitrix_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE evapremium_shop.pricing_extras ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'pricing_catalog_versions',
    'pricing_vehicle_categories',
    'pricing_category_aliases',
    'pricing_variants',
    'pricing_category_variants',
    'pricing_matrix',
    'pricing_template_overrides',
    'pricing_bitrix_mappings',
    'pricing_extras'
  ]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON evapremium_shop.%I',
      table_name || '_service_role',
      table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON evapremium_shop.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
      table_name || '_service_role',
      table_name
    );
  END LOOP;
END
$$;

GRANT USAGE ON SCHEMA evapremium_shop TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA evapremium_shop TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA evapremium_shop TO service_role;

NOTIFY pgrst, 'reload schema';
