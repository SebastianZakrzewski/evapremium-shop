-- mat_templates: liczba rzędów siedzeń + dostępność bagażnika małego/dużego
-- seat_rows: 1–20 (wypełniane z mapowania EVAMATS / katalogów)
-- trunk_small / trunk_large: yes | no | unknown

ALTER TABLE evapremium_shop.mat_templates
  ADD COLUMN IF NOT EXISTS seat_rows SMALLINT,
  ADD COLUMN IF NOT EXISTS trunk_small TEXT NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS trunk_large TEXT NOT NULL DEFAULT 'unknown';

ALTER TABLE evapremium_shop.mat_templates
  DROP CONSTRAINT IF EXISTS mat_templates_seat_rows_check;

ALTER TABLE evapremium_shop.mat_templates
  DROP CONSTRAINT IF EXISTS mat_templates_trunk_small_check;

ALTER TABLE evapremium_shop.mat_templates
  DROP CONSTRAINT IF EXISTS mat_templates_trunk_large_check;

ALTER TABLE evapremium_shop.mat_templates
  ADD CONSTRAINT mat_templates_seat_rows_check
    CHECK (seat_rows IS NULL OR (seat_rows >= 1 AND seat_rows <= 20));

ALTER TABLE evapremium_shop.mat_templates
  ADD CONSTRAINT mat_templates_trunk_small_check
    CHECK (trunk_small IN ('yes', 'no', 'unknown'));

ALTER TABLE evapremium_shop.mat_templates
  ADD CONSTRAINT mat_templates_trunk_large_check
    CHECK (trunk_large IN ('yes', 'no', 'unknown'));

CREATE INDEX IF NOT EXISTS mat_templates_seat_rows_idx
  ON evapremium_shop.mat_templates (seat_rows)
  WHERE seat_rows IS NOT NULL;

CREATE INDEX IF NOT EXISTS mat_templates_trunk_small_idx
  ON evapremium_shop.mat_templates (trunk_small);

CREATE INDEX IF NOT EXISTS mat_templates_trunk_large_idx
  ON evapremium_shop.mat_templates (trunk_large);

COMMENT ON COLUMN evapremium_shop.mat_templates.seat_rows IS
  'Liczba rzędów siedzeń dla szablonu dywaników (nie liczba miejsc). Wymagana po backfillu.';

COMMENT ON COLUMN evapremium_shop.mat_templates.trunk_small IS
  'Dostępność wariantu bagażnika małego: yes | no | unknown.';

COMMENT ON COLUMN evapremium_shop.mat_templates.trunk_large IS
  'Dostępność wariantu bagażnika dużego: yes | no | unknown.';

NOTIFY pgrst, 'reload schema';
