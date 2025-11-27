-- Dodaj kolumnę images do tabeli accessories dla wielu obrazów
ALTER TABLE accessories 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Komentarz do kolumny
COMMENT ON COLUMN accessories.images IS 'Tablica ścieżek do wielu obrazów produktu';

