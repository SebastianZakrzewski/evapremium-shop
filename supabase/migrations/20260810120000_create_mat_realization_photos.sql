-- Real installation / realization photos linked to mat_templates (1:N)
-- Schema: evapremium_shop
-- One mat_templates row → many mat_realization_photos rows
-- Brand / model / generation come from mat_templates via FK join

CREATE TABLE IF NOT EXISTS evapremium_shop.mat_realization_photos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  mat_template_id   UUID NOT NULL
    REFERENCES evapremium_shop.mat_templates(id) ON DELETE CASCADE,

  image_url         TEXT NOT NULL,
  alt_text          TEXT,
  caption           TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_primary        BOOLEAN NOT NULL DEFAULT false,
  is_active         BOOLEAN NOT NULL DEFAULT true,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT mat_realization_photos_image_url_not_blank
    CHECK (length(trim(image_url)) > 0),
  CONSTRAINT mat_realization_photos_sort_order_non_negative
    CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS mat_realization_photos_template_sort_idx
  ON evapremium_shop.mat_realization_photos (mat_template_id, sort_order)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS mat_realization_photos_template_id_idx
  ON evapremium_shop.mat_realization_photos (mat_template_id);

CREATE UNIQUE INDEX IF NOT EXISTS mat_realization_photos_one_primary_per_template_idx
  ON evapremium_shop.mat_realization_photos (mat_template_id)
  WHERE is_primary = true AND is_active = true;

CREATE TRIGGER mat_realization_photos_updated_at
  BEFORE UPDATE ON evapremium_shop.mat_realization_photos
  FOR EACH ROW EXECUTE FUNCTION evapremium_shop.set_updated_at();

ALTER TABLE evapremium_shop.mat_realization_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY mat_realization_photos_service_role
  ON evapremium_shop.mat_realization_photos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY mat_realization_photos_read_authenticated
  ON evapremium_shop.mat_realization_photos
  FOR SELECT
  TO authenticated
  USING (is_active = true);

GRANT SELECT, INSERT, UPDATE, DELETE ON evapremium_shop.mat_realization_photos
  TO postgres, service_role;
GRANT SELECT ON evapremium_shop.mat_realization_photos TO authenticator;

COMMENT ON TABLE evapremium_shop.mat_realization_photos IS
  'Zdjęcia z rzeczywistych realizacji dywaników dla konkretnego szablonu (marka/model/generacja). Relacja 1:N do mat_templates.';

COMMENT ON COLUMN evapremium_shop.mat_realization_photos.mat_template_id IS
  'FK do evapremium_shop.mat_templates(id). Marka, model i generacja wynikają z powiązanego szablonu.';

COMMENT ON COLUMN evapremium_shop.mat_realization_photos.image_url IS
  'Publiczny URL lub ścieżka Storage do zdjęcia realizacji.';

COMMENT ON COLUMN evapremium_shop.mat_realization_photos.sort_order IS
  'Kolejność w galerii (rosnąco).';

COMMENT ON COLUMN evapremium_shop.mat_realization_photos.is_primary IS
  'Wyróżnione zdjęcie realizacji dla szablonu (max jedno aktywne na mat_template_id).';

NOTIFY pgrst, 'reload schema';
