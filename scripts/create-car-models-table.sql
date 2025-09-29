-- Skrypt do utworzenia tabeli car_models_extended w Supabase
-- Na podstawie struktury pliku marki_modele_generacje_nadwozia.json

-- Utworzenie tabeli car_models_extended
CREATE TABLE IF NOT EXISTS car_models_extended (
    id SERIAL PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL,
    model_name VARCHAR(200) NOT NULL,
    generation VARCHAR(50) NOT NULL,
    body_type VARCHAR(100) NOT NULL,
    year_from INTEGER,
    year_to INTEGER,
    is_currently_produced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Utworzenie indeksów dla lepszej wydajności
CREATE INDEX IF NOT EXISTS idx_car_models_brand_name ON car_models_extended(brand_name);
CREATE INDEX IF NOT EXISTS idx_car_models_model_name ON car_models_extended(model_name);
CREATE INDEX IF NOT EXISTS idx_car_models_year_from ON car_models_extended(year_from);
CREATE INDEX IF NOT EXISTS idx_car_models_year_to ON car_models_extended(year_to);
CREATE INDEX IF NOT EXISTS idx_car_models_brand_model ON car_models_extended(brand_name, model_name);
CREATE INDEX IF NOT EXISTS idx_car_models_body_type ON car_models_extended(body_type);

-- Utworzenie tabeli body_types dla normalizacji typów nadwozia
CREATE TABLE IF NOT EXISTS body_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wstawienie podstawowych kategorii typów nadwozia
INSERT INTO body_types (name, category, description) VALUES
('hatchback 2drzwi', 'hatchback', 'Hatchback 2-drzwiowy'),
('hatchback 3drzwi', 'hatchback', 'Hatchback 3-drzwiowy'),
('hatchback 5drzwi', 'hatchback', 'Hatchback 5-drzwiowy'),
('hatchback 3/5drzwi', 'hatchback', 'Hatchback 3 lub 5-drzwiowy'),
('sedan', 'sedan', 'Sedan'),
('coupe', 'coupe', 'Coupe'),
('roadster', 'roadster', 'Roadster'),
('cabrio', 'cabrio', 'Kabriolet'),
('SUV', 'SUV', 'SUV'),
('SUV 5os.', 'SUV', 'SUV 5-osobowy'),
('SUV 7os.', 'SUV', 'SUV 7-osobowy'),
('kombi', 'kombi', 'Kombi'),
('kombi/ sedan', 'kombi', 'Kombi lub sedan'),
('minivan', 'minivan', 'Minivan'),
('VAN', 'van', 'Van'),
('dostawczak', 'van', 'Dostawczak'),
('van 4drzwi', 'van', 'Van 4-drzwiowy'),
('fastback', 'fastback', 'Fastback'),
('liftback', 'liftback', 'Liftback'),
('shooting brake', 'shooting_brake', 'Shooting brake')
ON CONFLICT (name) DO NOTHING;

-- Utworzenie funkcji do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Utworzenie triggera dla automatycznej aktualizacji updated_at
DROP TRIGGER IF EXISTS update_car_models_extended_updated_at ON car_models_extended;
CREATE TRIGGER update_car_models_extended_updated_at
    BEFORE UPDATE ON car_models_extended
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Utworzenie widoku dla łatwiejszego wyszukiwania
CREATE OR REPLACE VIEW car_models_search AS
SELECT 
    id,
    brand_name,
    model_name,
    generation,
    body_type,
    year_from,
    year_to,
    is_currently_produced,
    CASE 
        WHEN year_to IS NULL AND is_currently_produced = true THEN CONCAT(year_from, '+')
        WHEN year_to IS NOT NULL THEN CONCAT(year_from, '-', year_to)
        ELSE generation
    END as generation_display,
    created_at,
    updated_at
FROM car_models_extended;

-- Komentarze do tabeli i kolumn
COMMENT ON TABLE car_models_extended IS 'Rozszerzona tabela modeli samochodów z danymi o generacjach i typach nadwozia';
COMMENT ON COLUMN car_models_extended.brand_name IS 'Nazwa marki samochodu';
COMMENT ON COLUMN car_models_extended.model_name IS 'Nazwa modelu samochodu';
COMMENT ON COLUMN car_models_extended.generation IS 'Okres produkcji w formacie oryginalnym';
COMMENT ON COLUMN car_models_extended.body_type IS 'Typ nadwozia';
COMMENT ON COLUMN car_models_extended.year_from IS 'Rok rozpoczęcia produkcji';
COMMENT ON COLUMN car_models_extended.year_to IS 'Rok zakończenia produkcji (NULL = nadal produkowany)';
COMMENT ON COLUMN car_models_extended.is_currently_produced IS 'Czy model jest nadal produkowany';

-- Sprawdzenie czy tabela została utworzona poprawnie
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'car_models_extended'
ORDER BY ordinal_position;
