-- SQL do utworzenia tabeli CarMat w Supabase
-- Tabela mapowana na model CarMat

CREATE TABLE "CarMat" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "matType" TEXT NOT NULL,
  "cellStructure" TEXT NOT NULL,
  "materialColor" TEXT NOT NULL,
  "borderColor" TEXT NOT NULL,
  "imagePath" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dodaj komentarze dla dokumentacji
COMMENT ON TABLE "CarMat" IS 'Tabela przechowująca konfiguracje dywaników samochodowych';
COMMENT ON COLUMN "CarMat"."matType" IS 'Rodzaj dywanika (3D z rantami lub bez rantów)';
COMMENT ON COLUMN "CarMat"."cellStructure" IS 'Struktura komórek (romb/plaster miodu)';
COMMENT ON COLUMN "CarMat"."materialColor" IS 'Kolor materiału dywanika';
COMMENT ON COLUMN "CarMat"."borderColor" IS 'Kolor obszycia dywanika';
COMMENT ON COLUMN "CarMat"."imagePath" IS 'Ścieżka do zdjęcia dywanika';

-- Dodaj indeksy dla lepszej wydajności
CREATE INDEX "idx_carmat_mat_type" ON "CarMat" ("matType");
CREATE INDEX "idx_carmat_cell_structure" ON "CarMat" ("cellStructure");
CREATE INDEX "idx_carmat_material_color" ON "CarMat" ("materialColor");
CREATE INDEX "idx_carmat_border_color" ON "CarMat" ("borderColor");
CREATE INDEX "idx_carmat_created_at" ON "CarMat" ("createdAt");

-- Dodaj ograniczenia (constraints) dla walidacji danych
ALTER TABLE "CarMat" ADD CONSTRAINT "chk_mat_type" 
  CHECK ("matType" IN ('3d-with-rims', '3d-without-rims'));

ALTER TABLE "CarMat" ADD CONSTRAINT "chk_cell_structure" 
  CHECK ("cellStructure" IN ('rhombus', 'honeycomb'));

-- Dodaj trigger do automatycznego aktualizowania updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_carmat_updated_at 
  BEFORE UPDATE ON "CarMat" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
