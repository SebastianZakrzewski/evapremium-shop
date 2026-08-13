-- Scope all seeded model previews to template body_type_1_key / body_type_key
-- so other body types of the same model do not inherit the image.
-- Also remove accidental generic (NULL) scope on body-type-specific assets.

UPDATE evapremium_shop.mat_model_previews p
SET
  body_type_key = COALESCE(
    NULLIF(trim(t.body_type_1_key), ''),
    NULLIF(trim(t.body_type_key), ''),
    p.body_type_key
  ),
  updated_at = now()
FROM evapremium_shop.mat_templates t
WHERE p.mat_template_id = t.id
  AND p.is_active = true
  AND p.body_type_key IS NULL;

-- Ensure Astra F hatchback-only preview stays hatchback (already set; no-op safe)
UPDATE evapremium_shop.mat_model_previews
SET
  body_type_key = 'hatchback',
  updated_at = now()
WHERE mat_template_id = '30820fcb-3f0e-42ad-822f-69eba85bbf81'
  AND is_active = true
  AND is_primary = true;
