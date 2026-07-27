-- Lock down public API access for sensitive tables while preserving catalog reads.

ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_hub_messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.accessory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mat_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."Mats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.car_models_extended ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS accessories_public_read ON public.accessories;
CREATE POLICY accessories_public_read
  ON public.accessories
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS accessory_categories_public_read ON public.accessory_categories;
CREATE POLICY accessory_categories_public_read
  ON public.accessory_categories
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS mat_product_images_public_read ON public.mat_product_images;
CREATE POLICY mat_product_images_public_read
  ON public.mat_product_images
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS mats_public_read ON public."Mats";
CREATE POLICY mats_public_read
  ON public."Mats"
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS car_models_extended_public_read ON public.car_models_extended;
CREATE POLICY car_models_extended_public_read
  ON public.car_models_extended
  FOR SELECT
  TO anon, authenticated
  USING (true);
