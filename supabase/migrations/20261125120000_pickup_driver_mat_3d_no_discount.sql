-- Pickup 3D driver mat (Dywanik kierowcy, 3d-with-rims) should match the
-- passenger row: list price 289 PLN and no discount.
--
-- The shop catalog already lists 289. The evamats_v2 pickup row was
-- 350 → 280, so the bases did not match and the shop price was reduced
-- by the standard 20% to 231.20.
--
-- Manual step. Do not apply to production without explicit consent.
-- Passenger, minivan, bus, classic driver mats, and every other set stay
-- untouched: the WHERE clause is catalog evamats_v2, category pickup,
-- variant driver_mat, mat type 3d-with-rims.

UPDATE evapremium_shop.pricing_matrix AS matrix
SET
  base_price_pln = 289.00,
  price_after_discount_pln = NULL,
  discount_excluded = true
FROM
  evapremium_shop.pricing_catalog_versions AS catalog,
  evapremium_shop.pricing_vehicle_categories AS category,
  evapremium_shop.pricing_variants AS variant
WHERE
  matrix.catalog_version_id = catalog.id
  AND catalog.code = 'evamats_v2'
  AND matrix.vehicle_category_id = category.id
  AND category.slug = 'pickup'
  AND matrix.variant_id = variant.id
  AND variant.variant_key = 'driver_mat'
  AND matrix.mat_type = '3d-with-rims';

NOTIFY pgrst, 'reload schema';
