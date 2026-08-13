-- Seed model preview: Opel Agila A I (from image badge)

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
  '/dywaniki/previews/opel-agila-a-1-gen.png',
  'Dywaniki EVA Premium — Opel Agila A I (1 gen)',
  'Opel Agila A I',
  0,
  true,
  true
FROM evapremium_shop.mat_templates t
WHERE t.id = '7f203023-58ec-402d-9e14-fca8e61a8d57'
  AND t.is_active = true
  AND NOT EXISTS (
    SELECT 1
    FROM evapremium_shop.mat_model_previews p
    WHERE p.mat_template_id = t.id
      AND p.image_url = '/dywaniki/previews/opel-agila-a-1-gen.png'
  );
