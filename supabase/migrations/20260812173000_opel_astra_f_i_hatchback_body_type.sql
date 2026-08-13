-- Scope Opel Astra F I preview to hatchback (5-door)
-- Catalog body_type key for this template is "hatchback" (body_type_1_key)

UPDATE evapremium_shop.mat_model_previews p
SET
  body_type_key = 'hatchback',
  alt_text = 'Dywaniki EVA Premium — Opel Astra F I (1 gen), hatchback 5 drzwi',
  caption = 'Opel Astra F I',
  image_url = '/dywaniki/previews/opel-astra-f-1-gen.png',
  updated_at = now()
WHERE p.mat_template_id = '30820fcb-3f0e-42ad-822f-69eba85bbf81'
  AND p.is_primary = true
  AND p.is_active = true;
