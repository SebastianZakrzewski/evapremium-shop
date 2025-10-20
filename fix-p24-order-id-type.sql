-- Naprawa typu kolumny p24_order_id z INTEGER na VARCHAR
-- Przelewy24 zwraca bardzo długie identyfikatory transakcji które nie mieszczą się w INTEGER

-- Sprawdź aktualny typ kolumny
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'p24_order_id';

-- Zmień typ kolumny z INTEGER na VARCHAR(50)
-- VARCHAR(50) powinno wystarczyć dla identyfikatorów P24
ALTER TABLE orders 
ALTER COLUMN p24_order_id TYPE VARCHAR(50);

-- Dodaj komentarz do kolumny
COMMENT ON COLUMN orders.p24_order_id IS 'Order ID z Przelewy24 (po weryfikacji) - VARCHAR bo P24 zwraca bardzo długie ID';

-- Sprawdź czy zmiana została zastosowana
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'p24_order_id';
