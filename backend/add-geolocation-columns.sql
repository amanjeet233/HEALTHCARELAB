-- Add geolocation columns to lab_partners table
-- This migration adds latitude, longitude, and working_hours to support proximity-based search.

SET @db := DATABASE();

-- Add latitude
SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_partners' AND COLUMN_NAME = 'latitude'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE lab_partners ADD COLUMN latitude DOUBLE NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add longitude
SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_partners' AND COLUMN_NAME = 'longitude'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE lab_partners ADD COLUMN longitude DOUBLE NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add working_hours
SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_partners' AND COLUMN_NAME = 'working_hours'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE lab_partners ADD COLUMN working_hours VARCHAR(255) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index for geolocation queries
SET @idx_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_partners' AND INDEX_NAME = 'idx_lab_partners_geo'
);
SET @sql := IF(@idx_exists = 0,
    'CREATE INDEX idx_lab_partners_geo ON lab_partners(latitude, longitude, is_active)',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Seed sample geolocation data for existing labs
UPDATE lab_partners SET latitude = 28.6139, longitude = 77.2090, working_hours = '08:00-20:00' WHERE id = 1 AND latitude IS NULL;
UPDATE lab_partners SET latitude = 28.6353, longitude = 77.2250, working_hours = '07:00-21:00' WHERE id = 2 AND latitude IS NULL;
UPDATE lab_partners SET latitude = 28.5355, longitude = 77.2100, working_hours = '06:00-22:00' WHERE id = 3 AND latitude IS NULL;

SELECT 'Geolocation migration completed!' AS Status;
