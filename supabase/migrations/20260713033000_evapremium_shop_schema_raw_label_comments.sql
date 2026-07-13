-- Raw MARKA/MODEL label semantics for pricing_template_overrides (1:1 with mat_templates).

COMMENT ON TABLE evapremium_shop.mat_templates IS
  'EVAMATS template rows with verbatim Excel MARKA/MODEL labels (1:1, json_version raw-marka-model-1.0).';

COMMENT ON COLUMN evapremium_shop.pricing_template_overrides.brand_key IS
  'Verbatim Excel MARKA — must match mat_templates.brand_key after raw label migration.';

COMMENT ON COLUMN evapremium_shop.pricing_template_overrides.model_family_key IS
  'Verbatim Excel MODEL — must match mat_templates.model_family_key (same as model_name) after raw label migration.';

COMMENT ON TABLE evapremium_shop.pricing_template_overrides IS
  'Per-template pricing overrides keyed by raw MARKA/MODEL labels or template_record_key.';

COMMENT ON TABLE evapremium_shop.pricing_catalog_versions IS
  'Active pricing catalog package (matrix, overrides, extras). No vehicle brand/model columns.';

COMMENT ON TABLE evapremium_shop.pricing_vehicle_categories IS
  'Vehicle pricing segments (passenger_car, minivan, bus, …). No brand/model columns.';

COMMENT ON TABLE evapremium_shop.pricing_category_aliases IS
  'Slug aliases for pricing_vehicle_categories (e.g. premium_passenger_car).';

COMMENT ON TABLE evapremium_shop.pricing_variants IS
  'Sellable mat set variants (front, trunk_large, driver_mat, …).';

COMMENT ON TABLE evapremium_shop.pricing_category_variants IS
  'Which pricing_variants are available per vehicle category.';

COMMENT ON TABLE evapremium_shop.pricing_matrix IS
  'Base prices per catalog version, category, variant and mat type.';

COMMENT ON TABLE evapremium_shop.pricing_bitrix_mappings IS
  'Bitrix24 enum mapping for pricing variants per category.';

COMMENT ON TABLE evapremium_shop.pricing_extras IS
  'Catalog extras (shipping, surcharges).';

NOTIFY pgrst, 'reload schema';
