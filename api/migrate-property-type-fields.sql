-- Migrace: patro (byt) a plocha pozemku (dům) jako samostatné sloupce
-- Spusťte v phpMyAdmin. Pokud sloupce už existují, příkazy ALTER přeskočte.

ALTER TABLE properties ADD COLUMN floor VARCHAR(50) NULL AFTER area;
ALTER TABLE properties ADD COLUMN land_area INT UNSIGNED NULL AFTER floor;

-- Přesun existujících dat z JSON params do sloupců
UPDATE properties
SET floor = NULLIF(TRIM(JSON_UNQUOTE(JSON_EXTRACT(params, '$.floor'))), '')
WHERE params IS NOT NULL
  AND JSON_EXTRACT(params, '$.floor') IS NOT NULL
  AND JSON_UNQUOTE(JSON_EXTRACT(params, '$.floor')) != 'null';

UPDATE properties
SET land_area = CAST(JSON_EXTRACT(params, '$.landArea') AS UNSIGNED)
WHERE params IS NOT NULL
  AND JSON_EXTRACT(params, '$.landArea') IS NOT NULL;
