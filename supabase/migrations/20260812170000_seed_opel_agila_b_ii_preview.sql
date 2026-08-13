-- Seed model preview: Opel Agila B II (from image badge)

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
  '/dywaniki/previews/opel-agila-b-2-gen.png',
  'Dywaniki EVA Premium — Opel Agila B II (2 gen)',
  'Opel Agila B II',
  0,
  true,
  true
FROM evapremium_shop.mat_templates t
WHERE t.id = '6518005a-6f58-4228-b2b1-8c90596bf6f5'
  AND t.is_active = true
  AND NOT EXISTS (
    SELECT 1
    FROM evapremium_shop.mat_model_previews p
    WHERE p.mat_template_id = t.id
      AND p.image_url = '/dywaniki/previews/opel-agila-b-2-gen.png'
  );
