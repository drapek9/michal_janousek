-- Přidání typu nemovitosti „garáž“
ALTER TABLE properties
  MODIFY property_type ENUM('byt', 'dum', 'pozemek', 'komercni', 'garaz') NOT NULL DEFAULT 'byt';
