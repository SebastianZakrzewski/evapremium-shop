-- Dodanie kolumny p24_method_id do tabeli orders
-- Ta kolumna przechowuje ID metody płatności wybranej przez klienta w Przelewy24

ALTER TABLE orders 
ADD COLUMN p24_method_id INTEGER;

-- Dodaj komentarz do kolumny
COMMENT ON COLUMN orders.p24_method_id IS 'ID metody płatności wybranej w Przelewy24 (1=karta, 2=przelew, 3=BLIK, etc.)';

-- Sprawdź czy kolumna została dodana
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'p24_method_id';
