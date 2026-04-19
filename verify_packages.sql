-- Check if CH1 package exists
SELECT COUNT(*) as existing_ch1_count FROM test_packages WHERE package_code = 'CH1';

-- List all packages to see what's there
SELECT id, package_code, package_name, package_tier, is_active FROM test_packages LIMIT 20;

-- Check total package count
SELECT COUNT(*) as total_packages FROM test_packages;

-- If CH1 doesn't exist, insert it and related packages
INSERT IGNORE INTO test_packages (
    package_code, package_name, package_type, package_tier, discounted_price, 
    turnaround_hours, fasting_required, fasting_hours, total_tests, 
    age_group, gender_applicable, display_order, is_active, created_at
)
VALUES 
('CH1', 'Child Basic Silver (1-5 years)', 'CHILD', 'SILVER', 599.00, 24, 0, NULL, 20, 'PEDIATRIC', 'ALL', 4001, 1, NOW()),
('CH2', 'Child Immunity Silver', 'CHILD', 'SILVER', 799.00, 24, 0, NULL, 20, 'PEDIATRIC', 'ALL', 4002, 1, NOW()),
('CH3', 'Child Growth Silver', 'CHILD', 'SILVER', 699.00, 24, 0, NULL, 20, 'PEDIATRIC', 'ALL', 4003, 1, NOW()),
('CH4', 'Child Nutrition Silver', 'CHILD', 'SILVER', 799.00, 24, 0, NULL, 20, 'PEDIATRIC', 'ALL', 4004, 1, NOW()),
('CH5', 'Child Allergy Silver', 'CHILD', 'SILVER', 899.00, 24, 0, NULL, 20, 'PEDIATRIC', 'ALL', 4005, 1, NOW()),
('CH6', 'Child Sports Silver', 'CHILD', 'SILVER', 799.00, 24, 1, 8, 20, 'PEDIATRIC', 'ALL', 4006, 1, NOW()),
('CH7', 'Child Infection Silver', 'CHILD', 'SILVER', 699.00, 24, 0, NULL, 20, 'PEDIATRIC', 'ALL', 4007, 1, NOW()),
('CH8', 'Child Bone Silver', 'CHILD', 'SILVER', 899.00, 24, 1, 8, 20, 'PEDIATRIC', 'ALL', 4008, 1, NOW()),
('CH9', 'Child Complete Gold', 'CHILD', 'GOLD', 1799.00, 48, 1, 8, 35, 'PEDIATRIC', 'ALL', 4009, 1, NOW()),
('CH10', 'Child Sports Gold', 'CHILD', 'GOLD', 1999.00, 48, 1, 8, 35, 'PEDIATRIC', 'ALL', 4010, 1, NOW()),
('CH11', 'Child Allergy Gold', 'CHILD', 'GOLD', 2499.00, 48, 0, NULL, 35, 'PEDIATRIC', 'ALL', 4011, 1, NOW()),
('CH12', 'Child Development Gold', 'CHILD', 'GOLD', 2799.00, 48, 0, NULL, 35, 'PEDIATRIC', 'ALL', 4012, 1, NOW()),
('CH13', 'Child Complete Platinum (1-5 years)', 'CHILD', 'PLATINUM', 2999.00, 48, 0, NULL, 60, 'PEDIATRIC', 'ALL', 4013, 1, NOW()),
('CH14', 'Child Complete Platinum (6-12 years)', 'CHILD', 'PLATINUM', 3999.00, 48, 1, 8, 60, 'PEDIATRIC', 'ALL', 4014, 1, NOW()),
('CH15', 'Child Complete Platinum (13-17 years)', 'CHILD', 'PLATINUM', 4999.00, 48, 1, 8, 60, 'PEDIATRIC', 'ALL', 4015, 1, NOW()),
('CH16', 'Child Ultimate Advanced', 'CHILD', 'ADVANCED', 6999.00, 72, 1, 8, 100, 'PEDIATRIC', 'ALL', 4016, 1, NOW()),
('CH17', 'Child Special Needs Advanced', 'CHILD', 'ADVANCED', 5999.00, 72, 0, NULL, 100, 'PEDIATRIC', 'ALL', 4017, 1, NOW()),
('CH18', 'Child Obesity Advanced', 'CHILD', 'ADVANCED', 5499.00, 48, 1, 8, 100, 'PEDIATRIC', 'ALL', 4018, 1, NOW());

-- Verify CH1 was inserted
SELECT * FROM test_packages WHERE package_code = 'CH1';
