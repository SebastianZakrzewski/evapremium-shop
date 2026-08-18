-- Enforce seat_rows after production backfill from mat_templates_seat_rows.csv

ALTER TABLE evapremium_shop.mat_templates
  ALTER COLUMN seat_rows SET NOT NULL;

COMMENT ON COLUMN evapremium_shop.mat_templates.seat_rows IS
  'Liczba rzędów siedzeń dla szablonu dywaników (nie liczba miejsc). Wymagana dla każdego modelu.';

NOTIFY pgrst, 'reload schema';
