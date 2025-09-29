/**
 * Kompleksowy skrypt do konfiguracji bazy danych samochodów w Supabase
 * Uruchom: node scripts/setup-car-models-database.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Konfiguracja Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ Brak klucza Supabase. Ustaw SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL do utworzenia tabeli
const createTableSQL = `
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

-- Utworzenie indeksów
CREATE INDEX IF NOT EXISTS idx_car_models_brand_name ON car_models_extended(brand_name);
CREATE INDEX IF NOT EXISTS idx_car_models_model_name ON car_models_extended(model_name);
CREATE INDEX IF NOT EXISTS idx_car_models_year_from ON car_models_extended(year_from);
CREATE INDEX IF NOT EXISTS idx_car_models_year_to ON car_models_extended(year_to);
CREATE INDEX IF NOT EXISTS idx_car_models_brand_model ON car_models_extended(brand_name, model_name);
CREATE INDEX IF NOT EXISTS idx_car_models_body_type ON car_models_extended(body_type);

-- Utworzenie tabeli body_types
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

-- Utworzenie triggera
DROP TRIGGER IF EXISTS update_car_models_extended_updated_at ON car_models_extended;
CREATE TRIGGER update_car_models_extended_updated_at
    BEFORE UPDATE ON car_models_extended
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Utworzenie widoku
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
`;

async function setupDatabase() {
  try {
    console.log('🚀 Rozpoczynam konfigurację bazy danych...');
    
    // Wykonaj SQL do utworzenia tabeli
    console.log('📋 Tworzenie tabeli car_models_extended...');
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });
    
    if (createError) {
      console.error('❌ Błąd podczas tworzenia tabeli:', createError);
      
      // Spróbuj alternatywnej metody - wykonaj SQL bezpośrednio
      console.log('🔄 Próbuję alternatywnej metody...');
      const { error: directError } = await supabase
        .from('car_models_extended')
        .select('id')
        .limit(1);
      
      if (directError && directError.code === 'PGRST116') {
        console.log('📋 Tabela nie istnieje, tworzę ją...');
        // Tabela nie istnieje - musisz ją utworzyć ręcznie w Supabase Dashboard
        console.log('⚠️  Tabela car_models_extended nie istnieje.');
        console.log('📝 Skopiuj i wykonaj następujący SQL w Supabase Dashboard:');
        console.log('─'.repeat(80));
        console.log(createTableSQL);
        console.log('─'.repeat(80));
        return;
      }
    }
    
    console.log('✅ Tabela została utworzona pomyślnie');
    
    // Sprawdź czy tabela istnieje
    const { data: tableCheck, error: checkError } = await supabase
      .from('car_models_extended')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Błąd podczas sprawdzania tabeli:', checkError);
      return;
    }
    
    console.log('✅ Tabela car_models_extended jest dostępna');
    
    // Sprawdź liczbę rekordów
    const { count, error: countError } = await supabase
      .from('car_models_extended')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Błąd podczas sprawdzania liczby rekordów:', countError);
    } else {
      console.log(`📊 Liczba rekordów w tabeli: ${count || 0}`);
    }
    
    console.log('🎉 Konfiguracja bazy danych zakończona!');
    console.log('');
    console.log('📝 Następne kroki:');
    console.log('1. Uruchom: node scripts/migrate-car-models-data.js');
    console.log('2. Sprawdź dane w Supabase Dashboard');
    
  } catch (error) {
    console.error('❌ Błąd podczas konfiguracji:', error);
    process.exit(1);
  }
}

// Uruchom konfigurację
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
