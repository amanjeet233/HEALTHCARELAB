-- 1. Test Categories Master Table
CREATE TABLE IF NOT EXISTS test_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Alter lab_tests - adding new columns (idempotent)
-- NOTE: MySQL's `ADD COLUMN IF NOT EXISTS` is not available on all MySQL 8.x
-- installs. These checks work across a wider range of versions.

SET @db := DATABASE();

-- Add missing category_id (this is required by the JPA mapping)
SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND COLUMN_NAME = 'category_id'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE lab_tests ADD COLUMN category_id BIGINT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add FK constraint if missing
SET @fk_exists := (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = @db
        AND TABLE_NAME = 'lab_tests'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        AND CONSTRAINT_NAME = 'fk_lab_tests_category'
);
SET @sql := IF(@fk_exists = 0,
    'ALTER TABLE lab_tests ADD CONSTRAINT fk_lab_tests_category FOREIGN KEY (category_id) REFERENCES test_categories(id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index if missing
SET @idx_exists := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND INDEX_NAME = 'idx_lab_tests_category_id'
);
SET @sql := IF(@idx_exists = 0,
    'CREATE INDEX idx_lab_tests_category_id ON lab_tests(category_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add additional enhanced columns if missing
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND COLUMN_NAME = 'test_code'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE lab_tests ADD COLUMN test_code VARCHAR(50)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND COLUMN_NAME = 'test_type'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE lab_tests ADD COLUMN test_type VARCHAR(50)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND COLUMN_NAME = 'methodology'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE lab_tests ADD COLUMN methodology VARCHAR(100)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND COLUMN_NAME = 'unit'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE lab_tests ADD COLUMN unit VARCHAR(30)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND COLUMN_NAME = 'normal_range_min'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE lab_tests ADD COLUMN normal_range_min DECIMAL(12,4)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND COLUMN_NAME = 'normal_range_max'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE lab_tests ADD COLUMN normal_range_max DECIMAL(12,4)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND COLUMN_NAME = 'critical_low'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE lab_tests ADD COLUMN critical_low DECIMAL(12,4)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND COLUMN_NAME = 'critical_high'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE lab_tests ADD COLUMN critical_high DECIMAL(12,4)', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND COLUMN_NAME = 'normal_range_text'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE lab_tests ADD COLUMN normal_range_text TEXT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND COLUMN_NAME = 'pediatric_range'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE lab_tests ADD COLUMN pediatric_range TEXT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND COLUMN_NAME = 'male_range'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE lab_tests ADD COLUMN male_range TEXT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'lab_tests' AND COLUMN_NAME = 'female_range'
);
SET @sql := IF(@col_exists = 0, 'ALTER TABLE lab_tests ADD COLUMN female_range TEXT', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Test Packages Master Table
CREATE TABLE IF NOT EXISTS test_packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    package_code VARCHAR(50) NOT NULL UNIQUE,
    package_name VARCHAR(200) NOT NULL,
    description TEXT,
    total_tests INT,
    total_price DECIMAL(10,2),
    discounted_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Package-Test Mapping (Many-to-Many)
CREATE TABLE IF NOT EXISTS package_tests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    package_id BIGINT NOT NULL,
    test_id BIGINT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (package_id) REFERENCES test_packages(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES lab_tests(id) ON DELETE CASCADE,
    UNIQUE KEY unique_package_test (package_id, test_id)
);

-- 5. Test Parameters (for tests with multiple parameters)
CREATE TABLE IF NOT EXISTS test_parameters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_id BIGINT NOT NULL,
    parameter_name VARCHAR(200) NOT NULL,
    unit VARCHAR(30),
    normal_range_min DECIMAL(12,4),
    normal_range_max DECIMAL(12,4),
    critical_low DECIMAL(12,4),
    critical_high DECIMAL(12,4),
    normal_range_text TEXT,
    display_order INT DEFAULT 0,
    
    FOREIGN KEY (test_id) REFERENCES lab_tests(id) ON DELETE CASCADE,
    INDEX idx_parameter_test (test_id)
);

SELECT 'Schema update completed!' AS Status;
SHOW TABLES;
