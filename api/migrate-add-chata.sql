-- Přidání typu nemovitosti „chata“
ALTER TABLE properties
  MODIFY property_type ENUM('byt', 'dum', 'chata', 'pozemek', 'komercni', 'garaz') NOT NULL DEFAULT 'byt';
