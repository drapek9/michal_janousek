-- =============================================================================
-- INSTALACE TABULEK (Wedos – import přes admin účet aXXXXXX_* v phpMyAdmin)
-- =============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_sessions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  token CHAR(64) NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_sessions_user
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  INDEX idx_admin_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sloupce odpovídají polím zobrazeným na detailu nemovitosti (nemovitost.html)
CREATE TABLE IF NOT EXISTS properties (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(200) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  status ENUM('available', 'reserved', 'sold') NOT NULL DEFAULT 'available',
  offer_type ENUM('prodej', 'pronajem') NOT NULL DEFAULT 'prodej',
  property_type ENUM('byt', 'dum', 'pozemek', 'komercni', 'garaz') NOT NULL DEFAULT 'byt',
  price DECIMAL(12,0) NULL,
  location VARCHAR(300) NOT NULL,
  map_lat DECIMAL(10,7) NULL,
  map_lng DECIMAL(10,7) NULL,
  map_approximate TINYINT(1) NOT NULL DEFAULT 1,
  area INT UNSIGNED NULL,
  floor VARCHAR(50) NULL,
  land_area INT UNSIGNED NULL,
  rooms VARCHAR(50) NULL,
  condition_text VARCHAR(200) NULL,
  image VARCHAR(1000) NOT NULL,
  images JSON NULL,
  description TEXT NULL,
  location_detail JSON NULL,
  params JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_properties_status (status),
  INDEX idx_properties_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  text TEXT NOT NULL,
  author VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
