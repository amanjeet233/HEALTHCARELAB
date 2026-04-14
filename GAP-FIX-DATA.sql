-- =============================================================
-- GAP-FIX-DATA.SQL - Data Migration & Seeding for Project Gaps
-- =============================================================

-- 1. Insert Sample Doctors (Role: DOCTOR)
INSERT INTO users (name, email, password, role, phone, address, gender, is_active, created_at, updated_at)
VALUES 
('Dr. Rajesh Kumar', 'rajesh@clinic.com', '$2a$10$slYQmyNdGziq3wjgkkAL.e8VLdHdnI1OJ1lIuggdP70Y80vQiKRh2', 'DOCTOR', '9876500001', 'Delhi Medical Center', 'MALE', true, NOW(), NOW()),
('Dr. Priya Singh', 'priya@clinic.com', '$2a$10$slYQmyNdGziq3wjgkkAL.e8VLdHdnI1OJ1lIuggdP70Y80vQiKRh2', 'DOCTOR', '9876500002', 'Mumbai Heart Care', 'FEMALE', true, NOW(), NOW()),
('Dr. Amit Patel', 'amit@clinic.com', '$2a$10$slYQmyNdGziq3wjgkkAL.e8VLdHdnI1OJ1lIuggdP70Y80vQiKRh2', 'DOCTOR', '9876500003', 'Bangalore Neuro Inst', 'MALE', true, NOW(), NOW());

-- 2. Add Test Parameters and Reference Ranges for Hemoglobin (Test ID 1 assumed)
-- Note: Adjust ID if needed or use subqueries
INSERT INTO test_parameters (test_id, parameter_name, unit, display_order, created_at)
VALUES (1, 'Hemoglobin', 'g/dL', 1, NOW());

SET @HbParamId = LAST_INSERT_ID();

INSERT INTO reference_ranges (test_parameter_id, min_value, max_value, unit, gender, age_group, normal_range, created_at)
VALUES 
(@HbParamId, 13.5, 17.5, 'g/dL', 'MALE', 'ADULT', '13.5 - 17.5 g/dL', NOW()),
(@HbParamId, 12.0, 15.5, 'g/dL', 'FEMALE', 'ADULT', '12.0 - 15.5 g/dL', NOW());

-- 3. Seed Doctor-Test Assignments
-- Assuming Doctor IDs 5,6,7 (after admin, patient, tech, mo) and Test ID 1
INSERT INTO doctor_tests (doctor_id, test_id, is_active, assigned_at)
SELECT id, 1, true, NOW() FROM users WHERE email IN ('rajesh@clinic.com', 'priya@clinic.com');

-- 4. Verify Data (Diagnostic Queries)
-- SELECT u.name, lt.test_name FROM doctor_tests dt 
-- JOIN users u ON dt.doctor_id = u.id 
-- JOIN lab_tests lt ON dt.test_id = lt.id;
