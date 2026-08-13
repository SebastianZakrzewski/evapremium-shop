-- Seed model preview: Opel Adam I (from image badge)

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
  '/dywaniki/previews/opel-adam-1-gen.png',
  'Dywaniki EVA Premium — Opel Adam I (1 gen)',
  'Opel Adam I',
  0,
  true,
  true
FROM evapremium_shop.mat_templates t
WHERE t.id = '2d68af1a-6389-4e04-81d5-f7bb7c1b9dab'
  AND t.is_active = true
  AND NOT EXISTS (
    SELECT 1
    FROM evapremium_shop.mat_model_previews p
    WHERE p.mat_template_id = t.id
      AND p.image_url = '/dywaniki/previews/opel-adam-1-gen.png'
  );
