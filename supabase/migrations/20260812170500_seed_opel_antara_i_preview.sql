-- Seed model preview: Opel Antara I (from image badge)

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
  '/dywaniki/previews/opel-antara-1-gen.png',
  'Dywaniki EVA Premium — Opel Antara I (1 gen)',
  'Opel Antara I',
  0,
  true,
  true
FROM evapremium_shop.mat_templates t
WHERE t.id = '543f9368-859a-4dc5-b392-25fa093e6d1d'
  AND t.is_active = true
  AND NOT EXISTS (
    SELECT 1
    FROM evapremium_shop.mat_model_previews p
    WHERE p.mat_template_id = t.id
      AND p.image_url = '/dywaniki/previews/opel-antara-1-gen.png'
  );
