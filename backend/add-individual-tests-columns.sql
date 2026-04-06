-- Migration: Add subTests and tags columns to tests table
-- Description: Add JSON columns to support individual tests with sub-tests and tags

-- Add new columns if they don't exist
ALTER TABLE tests 
  ADD COLUMN IF NOT EXISTS sub_tests JSON DEFAULT '[]' COMMENT 'Array of sub-tests included in this test',
  ADD COLUMN IF NOT EXISTS tags JSON DEFAULT '[]' COMMENT 'Array of tags for filtering/searching',
  MODIFY COLUMN turnaround_time VARCHAR(255) COMMENT 'Human-readable turnaround time (e.g., "24 hours", "2 days")',
  MODIFY COLUMN sample_type VARCHAR(255) COMMENT 'Type of sample required (e.g., "Blood", "Urine")';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_category_active ON tests(category_name, is_active);
CREATE INDEX IF NOT EXISTS idx_price_active ON tests(price, is_active);
CREATE INDEX IF NOT EXISTS idx_fasting_active ON tests(fasting_required, is_active);
CREATE INDEX IF NOT EXISTS idx_test_code ON tests(test_code);

-- Update existing tests to have default fasting_required if null
UPDATE tests SET fasting_required = FALSE WHERE fasting_required IS NULL;

-- Add helper columns for easier queries (optional, can be used for performance optimization)
ALTER TABLE tests 
  ADD COLUMN IF NOT EXISTS test_count INT DEFAULT 0 COMMENT 'Number of sub-tests',
  ADD COLUMN IF NOT EXISTS tag_count INT DEFAULT 0 COMMENT 'Number of tags';

-- Create a view for quick test listing (optional)
CREATE OR REPLACE VIEW v_active_tests AS
SELECT 
  id,
  test_code,
  test_name,
  category_name,
  price,
  original_price,
  description,
  turnaround_time,
  fasting_required,
  fasting_hours,
  sample_type,
  sub_tests,
  tags,
  is_active,
  created_at,
  updated_at
FROM tests
WHERE is_active = TRUE
ORDER BY test_name;

-- Create aggregation table for category statistics (optional)
CREATE TABLE IF NOT EXISTS test_category_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(50) NOT NULL UNIQUE,
  total_tests INT DEFAULT 0,
  avg_price DECIMAL(10, 2) DEFAULT 0,
  min_price DECIMAL(10, 2) DEFAULT 0,
  max_price DECIMAL(10, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category_name)
);

-- Trigger to update test counts (optional, for performance)
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS tr_update_test_count_on_insert
AFTER INSERT ON tests
FOR EACH ROW
BEGIN
  IF NEW.sub_tests IS NOT NULL THEN
    UPDATE tests SET test_count = JSON_LENGTH(NEW.sub_tests) WHERE id = NEW.id;
  END IF;
  IF NEW.tags IS NOT NULL THEN
    UPDATE tests SET tag_count = JSON_LENGTH(NEW.tags) WHERE id = NEW.id;
  END IF;
END$$

CREATE TRIGGER IF NOT EXISTS tr_update_test_count_on_update
AFTER UPDATE ON tests
FOR EACH ROW
BEGIN
  IF NEW.sub_tests IS NOT NULL THEN
    UPDATE tests SET test_count = JSON_LENGTH(NEW.sub_tests) WHERE id = NEW.id;
  END IF;
  IF NEW.tags IS NOT NULL THEN
    UPDATE tests SET tag_count = JSON_LENGTH(NEW.tags) WHERE id = NEW.id;
  END IF;
END$$

DELIMITER ;

-- Verify the migration
SELECT COUNT(*) as total_tests, 
       COUNT(CASE WHEN sub_tests IS NOT NULL AND JSON_LENGTH(sub_tests) > 0 THEN 1 END) as tests_with_subtests,
       COUNT(CASE WHEN tags IS NOT NULL AND JSON_LENGTH(tags) > 0 THEN 1 END) as tests_with_tags
FROM tests;

-- Display category breakdown
SELECT category_name, COUNT(*) as count FROM tests WHERE is_active = TRUE GROUP BY category_name;
