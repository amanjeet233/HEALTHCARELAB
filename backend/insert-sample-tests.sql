-- Insert sample lab tests for booking testing
-- Run this script if no lab tests exist in the database

INSERT INTO lab_tests (test_name, description, price, category, preparation_notes, fasting_required, fasting_hours, report_time_hours, is_active, created_at)
VALUES 
    ('Complete Blood Count (CBC)', 'Measures different components and features of blood including red and white blood cells and platelets', 500.00, 'Hematology', 'No special preparation required', FALSE, NULL, 24, TRUE, NOW()),
    ('Lipid Profile', 'Measures cholesterol and triglycerides in the blood', 800.00, 'Biochemistry', 'Fasting for 12-14 hours required', TRUE, 12, 24, TRUE, NOW()),
    ('Blood Sugar Fasting', 'Measures blood glucose levels after fasting', 150.00, 'Biochemistry', 'Fasting for 8-10 hours required', TRUE, 8, 4, TRUE, NOW()),
    ('Thyroid Function Test (TFT)', 'Measures thyroid hormones (T3, T4, TSH)', 600.00, 'Endocrinology', 'No special preparation required', FALSE, NULL, 48, TRUE, NOW()),
    ('Liver Function Test (LFT)', 'Measures liver enzymes and proteins', 700.00, 'Biochemistry', 'Fasting for 8-10 hours recommended', TRUE, 8, 24, TRUE, NOW())
ON DUPLICATE KEY UPDATE test_name=test_name;

-- Verify the inserted data
SELECT id, test_name, price, is_active FROM lab_tests;
