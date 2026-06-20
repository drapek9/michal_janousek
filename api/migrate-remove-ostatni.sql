-- Migrace: odstranění typu nemovitosti „ostatni“
-- Spusťte v phpMyAdmin. Nejdřív převede existující záznamy, pak upraví ENUM.

UPDATE properties SET property_type = 'komercni' WHERE property_type = 'ostatni';

ALTER TABLE properties
  MODIFY property_type ENUM('byt', 'dum', 'pozemek', 'komercni') NOT NULL DEFAULT 'byt';
