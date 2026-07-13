-- Replace normalized brand/model labels with verbatim Excel MARKA/MODEL (1:1).
-- Data backfill: node scripts/seed-mat-templates-raw-brand-model.mjs

COMMENT ON COLUMN evapremium_shop.mat_templates.brand_name IS
  'Excel column MARKA — verbatim, no normalization.';

COMMENT ON COLUMN evapremium_shop.mat_templates.brand_key IS
  'Same value as brand_name (MARKA 1:1).';

COMMENT ON COLUMN evapremium_shop.mat_templates.model_name IS
  'Excel column MODEL — verbatim, no normalization.';

COMMENT ON COLUMN evapremium_shop.mat_templates.model_key IS
  'Same value as model_name (MODEL 1:1).';

COMMENT ON COLUMN evapremium_shop.mat_templates.model_family_name IS
  'Same value as model_name (MODEL 1:1) after raw label migration.';

COMMENT ON COLUMN evapremium_shop.mat_templates.model_family_key IS
  'Same value as model_name (MODEL 1:1) after raw label migration.';

NOTIFY pgrst, 'reload schema';
