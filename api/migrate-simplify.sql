-- Migrace: zjednodušení tabulky properties (spusťte v phpMyAdmin jako admin aXXXXXX_*)
-- Sloučí město do lokality, pak odstraní zbytečné sloupce.
-- Pokud sloupec neexistuje, daný příkaz přeskočte (chyba je v pořádku).

-- 1) Sloučit city do location (pokud city existuje a není prázdné)
UPDATE properties
SET location = TRIM(CONCAT(location, ', ', city))
WHERE city IS NOT NULL AND city != '' AND location NOT LIKE CONCAT('%', city, '%');

-- 2) Legacy sloupce (spusťte jen ty, které v tabulce ještě jsou)
ALTER TABLE properties DROP COLUMN published_at;
ALTER TABLE properties DROP COLUMN amenities;
ALTER TABLE properties DROP COLUMN features;
ALTER TABLE properties DROP COLUMN year_built;
ALTER TABLE properties DROP COLUMN energy_class;
ALTER TABLE properties DROP COLUMN sreality_id;
ALTER TABLE properties DROP COLUMN external_url;

-- 3) Štítek ceny a samostatné město
ALTER TABLE properties DROP COLUMN price_label;
ALTER TABLE properties DROP COLUMN city;
