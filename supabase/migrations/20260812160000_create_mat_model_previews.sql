-- Product preview images linked to mat_templates (1:N)
-- Schema: evapremium_shop
-- Use cases:
--   - /dywaniki?brand={model} model cards
--   - configurator entry (card / quick search)
-- Brand / model / generation come from mat_templates via FK join
-- Distinct from:
--   - mat_realization_photos (real installation gallery)
--   - public.mat_product_images (legacy slug-based product gallery)

CREATE TABLE IF NOT EXISTS evapremium_shop.mat_model_previews (
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

  CONSTRAINT mat_model_previews_image_url_not_blank
    CHECK (length(trim(image_url)) > 0),
  CONSTRAINT mat_model_previews_sort_order_non_negative
    CHECK (sort_order >= 0)
);

CREATE INDEX IF NOT EXISTS mat_model_previews_template_sort_idx
  ON evapremium_shop.mat_model_previews (mat_template_id, sort_order)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS mat_model_previews_template_id_idx
  ON evapremium_shop.mat_model_previews (mat_template_id);

-- One primary active preview per template (listing / entry hero)
CREATE UNIQUE INDEX IF NOT EXISTS mat_model_previews_one_primary_per_template_idx
  ON evapremium_shop.mat_model_previews (mat_template_id)
  WHERE is_primary = true AND is_active = true;

CREATE TRIGGER mat_model_previews_updated_at
  BEFORE UPDATE ON evapremium_shop.mat_model_previews
  FOR EACH ROW EXECUTE FUNCTION evapremium_shop.set_updated_at();

ALTER TABLE evapremium_shop.mat_model_previews ENABLE ROW LEVEL SECURITY;

CREATE POLICY mat_model_previews_service_role
  ON evapremium_shop.mat_model_previews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY mat_model_previews_read_authenticated
  ON evapremium_shop.mat_model_previews
  FOR SELECT
  TO authenticated
  USING (is_active = true);

GRANT SELECT, INSERT, UPDATE, DELETE ON evapremium_shop.mat_model_previews
  TO postgres, service_role;
GRANT SELECT ON evapremium_shop.mat_model_previews TO authenticator;

COMMENT ON TABLE evapremium_shop.mat_model_previews IS
  'Zdjęcia podglądowe produktu (kompozyt auto + dywaniki) dla szablonu marka/model/generacja. Relacja 1:N do mat_templates. Używane na /dywaniki?brand=… oraz przy wejściu do konfiguratora (karta / szybkie wyszukiwanie).';

COMMENT ON COLUMN evapremium_shop.mat_model_previews.mat_template_id IS
  'FK do evapremium_shop.mat_templates(id). Marka, model i generacja wynikają z powiązanego szablonu.';

COMMENT ON COLUMN evapremium_shop.mat_model_previews.image_url IS
  'Publiczny URL lub ścieżka (np. /dywaniki/previews/opel-mokka-1-gen.png) do zdjęcia podglądowego.';

COMMENT ON COLUMN evapremium_shop.mat_model_previews.sort_order IS
  'Kolejność w galerii podglądów (rosnąco).';

COMMENT ON COLUMN evapremium_shop.mat_model_previews.is_primary IS
  'Główne zdjęcie podglądowe szablonu (max jedno aktywne na mat_template_id) — karty na /dywaniki i hero przy wejściu do konfiguratora.';

-- Seed: Opel Mokka 1 gen (2012-2020)
INSERT INTO evapremium_shop.mat_model_previews (
  mat_template_id,
  image_url,
  alt_text,
  caption,
  sort_order,
  is_primary,
  is_active
)
SELECT
  t.id,
  '/dywaniki/previews/opel-mokka-1-gen.png',
  'Dywaniki EVA Premium — Opel Mokka I (1 gen)',
  'Opel Mokka I',
  0,
  true,
  true
FROM evapremium_shop.mat_templates t
WHERE t.id = 'dc352be9-124d-494a-be64-0c3493adf106'
  AND t.is_active = true
  AND NOT EXISTS (
    SELECT 1
    FROM evapremium_shop.mat_model_previews p
    WHERE p.mat_template_id = t.id
      AND p.image_url = '/dywaniki/previews/opel-mokka-1-gen.png'
  );

NOTIFY pgrst, 'reload schema';
