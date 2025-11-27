-- Dodaj kolumnę available_colors do tabeli accessories dla wariantów kolorów
ALTER TABLE accessories 
ADD COLUMN IF NOT EXISTS available_colors TEXT[];

-- Dodaj kolumnę color_images JSONB dla mapowania kolor -> obraz
ALTER TABLE accessories 
ADD COLUMN IF NOT EXISTS color_images JSONB;

-- Komentarze do kolumn
COMMENT ON COLUMN accessories.available_colors IS 'Tablica dostępnych kolorów produktu';
COMMENT ON COLUMN accessories.color_images IS 'Mapowanie kolor -> ścieżka obrazu w formacie JSON: {"brązowa": "/images/...", "czerwona": "/images/..."}';

