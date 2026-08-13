-- Add body_type_key to mat_model_previews
-- NULL = preview applies to all body types of the template
-- set value (e.g. suv, hatchback, sedan) = preview for that body type only
-- Models with multiple body types → multiple preview rows (same or different images)

ALTER TABLE evapremium_shop.mat_model_previews
  ADD COLUMN IF NOT EXISTS body_type_key TEXT;

ALTER TABLE evapremium_shop.mat_model_previews
  DROP CONSTRAINT IF EXISTS mat_model_previews_body_type_key_not_blank;

ALTER TABLE evapremium_shop.mat_model_previews
  ADD CONSTRAINT mat_model_previews_body_type_key_not_blank
  CHECK (body_type_key IS NULL OR length(trim(body_type_key)) > 0);

DROP INDEX IF EXISTS evapremium_shop.mat_model_previews_one_primary_per_template_idx;

-- One primary per template + body type scope (NULL = generic / all body types)
CREATE UNIQUE INDEX IF NOT EXISTS mat_model_previews_one_primary_per_template_body_idx
  ON evapremium_shop.mat_model_previews (mat_template_id, (COALESCE(body_type_key, '')))
  WHERE is_primary = true AND is_active = true;

CREATE INDEX IF NOT EXISTS mat_model_previews_template_body_sort_idx
  ON evapremium_shop.mat_model_previews (mat_template_id, body_type_key, sort_order)
  WHERE is_active = true;

COMMENT ON COLUMN evapremium_shop.mat_model_previews.body_type_key IS
  'Klucz typu nadwozia (np. suv, hatchback, sedan). NULL = podgląd wspólny dla wszystkich typów nadwozia szablonu. Przy kilku typach — osobne rekordy (ten sam lub różny image_url).';

NOTIFY pgrst, 'reload schema';
