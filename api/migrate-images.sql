-- Migrace: galerie dalších fotografií (JSON pole URL)
-- Spusťte v phpMyAdmin, pokud sloupec images v tabulce properties chybí.

ALTER TABLE properties ADD COLUMN images JSON NULL AFTER image;
