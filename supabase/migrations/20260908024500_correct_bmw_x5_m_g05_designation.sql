-- BMW X5 M 4th-gen civilian chassis (G05) is not a valid X5 M code.
-- The M variant of that era is F95 (3rd gen X5 M). Hide the mislabeled duplicate.

UPDATE evapremium_shop.mat_templates
SET
  model_name = 'X5 M (F95) 3 gen',
  model_key = 'X5 M (F95) 3 gen',
  model_family_name = 'X5 M (F95) 3 gen',
  model_family_key = 'X5 M (F95) 3 gen',
  is_active = false,
  updated_at = now()
WHERE id = '834b8f20-7137-4ef7-a3c9-c1f3fb9dffb1'
  AND source_row_id = 266
  AND model_name = 'X5 M(G05) 4 gen';
