-- complete (mata do bagażnika): 3D z rantami w tej samej cenie co classic

INSERT INTO evapremium_shop.pricing_matrix (
  catalog_version_id,
  vehicle_category_id,
  variant_id,
  mat_type,
  base_price_pln,
  price_after_discount_pln,
  discount_excluded
)
SELECT
  classic.catalog_version_id,
  classic.vehicle_category_id,
  classic.variant_id,
  '3d-with-rims',
  classic.base_price_pln,
  classic.price_after_discount_pln,
  classic.discount_excluded
FROM evapremium_shop.pricing_matrix AS classic
INNER JOIN evapremium_shop.pricing_variants AS variants
  ON variants.id = classic.variant_id
WHERE
  variants.variant_key = 'complete'
  AND classic.mat_type = 'classic'
  AND NOT EXISTS (
    SELECT 1
    FROM evapremium_shop.pricing_matrix AS rims
    WHERE
      rims.catalog_version_id = classic.catalog_version_id
      AND rims.vehicle_category_id = classic.vehicle_category_id
      AND rims.variant_id = classic.variant_id
      AND rims.mat_type = '3d-with-rims'
  );

NOTIFY pgrst, 'reload schema';
