-- ===========================================
-- SQL DO DODANIA KOLUMNY Z ZDJĘCIEM MARKI
-- ===========================================
-- Wykonaj ten skrypt w Supabase Dashboard > SQL Editor

-- Dodanie kolumny brand_image do tabeli car_models_extended
ALTER TABLE car_models_extended 
ADD COLUMN IF NOT EXISTS brand_image VARCHAR(500);

-- Dodanie komentarza do kolumny
COMMENT ON COLUMN car_models_extended.brand_image IS 'URL do zdjęcia/logo marki samochodu';

-- Opcjonalnie: Dodanie indeksu dla lepszej wydajności (jeśli będziesz filtrować po zdjęciach)
-- CREATE INDEX IF NOT EXISTS idx_car_models_brand_image ON car_models_extended(brand_image);

-- Sprawdzenie czy kolumna została dodana
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'car_models_extended' 
AND column_name = 'brand_image';
