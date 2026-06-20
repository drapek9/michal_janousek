-- Migrace: souřadnice mapy jako samostatné sloupce
-- Spusťte v phpMyAdmin. Pokud sloupce už existují, ALTER přeskočte.

ALTER TABLE properties ADD COLUMN map_lat DECIMAL(10,7) NULL AFTER location;
ALTER TABLE properties ADD COLUMN map_lng DECIMAL(10,7) NULL AFTER map_lat;
ALTER TABLE properties ADD COLUMN map_approximate TINYINT(1) NOT NULL DEFAULT 1 AFTER map_lng;

-- Přesun z legacy JSON location_detail
UPDATE properties
SET
  map_lat = CAST(JSON_UNQUOTE(JSON_EXTRACT(location_detail, '$.lat')) AS DECIMAL(10,7)),
  map_lng = CAST(JSON_UNQUOTE(JSON_EXTRACT(location_detail, '$.lng')) AS DECIMAL(10,7)),
  map_approximate = IF(JSON_EXTRACT(location_detail, '$.approximate') = false, 0, 1)
WHERE location_detail IS NOT NULL
  AND JSON_EXTRACT(location_detail, '$.lat') IS NOT NULL
  AND JSON_EXTRACT(location_detail, '$.lng') IS NOT NULL;
