-- ===========================================
-- SQL DO DODANIA KOLUMN Z ZDJĘCIAMI MARKI I MODELU
-- ===========================================
-- Wykonaj ten skrypt w Supabase Dashboard > SQL Editor

-- Dodanie kolumny brand_image do tabeli car_models_extended
ALTER TABLE car_models_extended 
ADD COLUMN IF NOT EXISTS brand_image VARCHAR(500);

-- Dodanie kolumny model_image do tabeli car_models_extended
ALTER TABLE car_models_extended 
ADD COLUMN IF NOT EXISTS model_image VARCHAR(500);

-- Dodanie komentarzy do kolumn
COMMENT ON COLUMN car_models_extended.brand_image IS 'URL do zdjęcia/logo marki samochodu';
COMMENT ON COLUMN car_models_extended.model_image IS 'URL do zdjęcia konkretnego modelu samochodu';

-- Opcjonalnie: Dodanie indeksów dla lepszej wydajności
-- CREATE INDEX IF NOT EXISTS idx_car_models_brand_image ON car_models_extended(brand_image);
-- CREATE INDEX IF NOT EXISTS idx_car_models_model_image ON car_models_extended(model_image);

-- Sprawdzenie czy kolumny zostały dodane
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'car_models_extended' 
AND column_name IN ('brand_image', 'model_image')
ORDER BY column_name;
