-- Migracja: Zmiana product_id na nullable dla matów w order_items
-- Data: 2025-01-XX
-- Opis: Maty są produktami konfigurowanymi i nie mają stałego rekordu w tabeli mats,
--       więc product_id powinien być nullable dla matów

-- Zmień kolumnę product_id na nullable
ALTER TABLE order_items 
ALTER COLUMN product_id DROP NOT NULL;

-- Zaktualizuj komentarz kolumny
COMMENT ON COLUMN order_items.product_id IS 'ID z tabeli accessories (dla akcesoriów) lub NULL (dla matów - produkty konfigurowane)';

-- Opcjonalnie: Ustaw product_id na NULL dla istniejących rekordów matów (jeśli są)
-- UPDATE order_items 
-- SET product_id = NULL 
-- WHERE product_type = 'mat' AND product_id IS NOT NULL;








