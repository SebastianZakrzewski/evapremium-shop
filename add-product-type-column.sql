-- Dodaj kolumnę product_type do tabeli accessories dla identyfikacji typu produktu
ALTER TABLE accessories 
ADD COLUMN IF NOT EXISTS product_type VARCHAR(50);

-- Komentarz do kolumny
COMMENT ON COLUMN accessories.product_type IS 'Typ produktu: organizer lub podpietka';

-- Utwórz indeks dla szybszego wyszukiwania
CREATE INDEX IF NOT EXISTS idx_accessories_product_type ON accessories(product_type);

