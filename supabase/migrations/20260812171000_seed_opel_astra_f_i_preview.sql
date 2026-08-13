-- Seed model preview: Opel Astra F I (from image badge)

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
  '/dywaniki/previews/opel-astra-f-1-gen.png',
  'Dywaniki EVA Premium — Opel Astra F I (1 gen)',
  'Opel Astra F I',
  0,
  true,
  true
FROM evapremium_shop.mat_templates t
WHERE t.id = '30820fcb-3f0e-42ad-822f-69eba85bbf81'
  AND t.is_active = true
  AND NOT EXISTS (
    SELECT 1
    FROM evapremium_shop.mat_model_previews p
    WHERE p.mat_template_id = t.id
      AND p.image_url = '/dywaniki/previews/opel-astra-f-1-gen.png'
  );
