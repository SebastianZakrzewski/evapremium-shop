-- Seed model previews: Opel Mokka II + Opel Mokka-e I
-- Names read from badge on source images

-- Opel Mokka II → all Mokka 2 gen templates (duplicate catalog rows share one visual)
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
  '/dywaniki/previews/opel-mokka-2-gen.png',
  'Dywaniki EVA Premium — Opel Mokka II (2 gen)',
  'Opel Mokka II',
  0,
  true,
  true
FROM evapremium_shop.mat_templates t
WHERE t.brand_key = 'Opel'
  AND t.model_key = 'Mokka 2 gen'
  AND t.is_active = true
  AND NOT EXISTS (
    SELECT 1
    FROM evapremium_shop.mat_model_previews p
    WHERE p.mat_template_id = t.id
      AND p.image_url = '/dywaniki/previews/opel-mokka-2-gen.png'
  );

-- Opel Mokka-e I → Mokka-e 1 gen
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
  '/dywaniki/previews/opel-mokka-e-1-gen.png',
  'Dywaniki EVA Premium — Opel Mokka-e I (1 gen)',
  'Opel Mokka-e I',
  0,
  true,
  true
FROM evapremium_shop.mat_templates t
WHERE t.id = '7da5a0b4-f8d9-4006-bded-01174493f128'
  AND t.is_active = true
  AND NOT EXISTS (
    SELECT 1
    FROM evapremium_shop.mat_model_previews p
    WHERE p.mat_template_id = t.id
      AND p.image_url = '/dywaniki/previews/opel-mokka-e-1-gen.png'
  );
