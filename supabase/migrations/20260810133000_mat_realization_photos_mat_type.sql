-- Add mat_type to realization photos (3D z rantami / 3D bez rantów)
-- App values: 3d-with-rims | classic

ALTER TABLE evapremium_shop.mat_realization_photos
  ADD COLUMN IF NOT EXISTS mat_type TEXT;

UPDATE evapremium_shop.mat_realization_photos
SET mat_type = '3d-with-rims'
WHERE mat_type IS NULL;

ALTER TABLE evapremium_shop.mat_realization_photos
  ALTER COLUMN mat_type SET NOT NULL,
  ALTER COLUMN mat_type SET DEFAULT '3d-with-rims';

ALTER TABLE evapremium_shop.mat_realization_photos
  DROP CONSTRAINT IF EXISTS mat_realization_photos_mat_type_check;

ALTER TABLE evapremium_shop.mat_realization_photos
  ADD CONSTRAINT mat_realization_photos_mat_type_check
  CHECK (mat_type IN ('3d-with-rims', 'classic'));

DROP INDEX IF EXISTS evapremium_shop.mat_realization_photos_one_primary_per_template_idx;

CREATE UNIQUE INDEX IF NOT EXISTS mat_realization_photos_one_primary_per_template_type_idx
  ON evapremium_shop.mat_realization_photos (mat_template_id, mat_type)
  WHERE is_primary = true AND is_active = true;

DROP INDEX IF EXISTS evapremium_shop.mat_realization_photos_template_sort_idx;

CREATE INDEX IF NOT EXISTS mat_realization_photos_template_type_sort_idx
  ON evapremium_shop.mat_realization_photos (mat_template_id, mat_type, sort_order)
  WHERE is_active = true;

COMMENT ON COLUMN evapremium_shop.mat_realization_photos.mat_type IS
  'Typ dywanika: 3d-with-rims (3D z rantami) lub classic (3D bez rantów). Filtruje galerię realizacji w konfiguratorze.';

NOTIFY pgrst, 'reload schema';
