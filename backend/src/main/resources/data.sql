-- =============================================================
-- DATA.SQL - Initial Seed Data for Lab Test Booking System
-- =============================================================
-- This file is executed by Spring Boot before running tests
-- It ensures the database has initial test data for development/testing

-- ========== INSERT LAB TESTS ==========
-- Insert 5+ lab tests with all required fields
INSERT INTO lab_tests (test_name, category, description, price, fasting_required, fasting_hours, report_time_hours, preparation_notes, is_active) 
VALUES
('Blood Glucose Test', 'Blood Work', 'Fasting glucose test to check blood sugar levels', 200.00, true, 8, 24, 'Fast for 8 hours before test', true),
('Complete Blood Count (CBC)', 'Blood Work', 'Measures red blood cells, white blood cells, and platelets', 300.00, false, 0, 24, 'No special preparation required', true),
('Thyroid Profile (TSH, T3, T4)', 'Endocrinology', 'Tests thyroid function and hormone levels', 500.00, false, 0, 48, 'Can eat and drink normally before test', true),
('Lipid Profile', 'Cardiology', 'Measures cholesterol and triglycerides in blood', 250.00, true, 12, 24, 'Fast for 12 hours. Avoid alcohol 24 hours before test', true),
('Liver Function Test (LFT)', 'Hepatology', 'Evaluates liver health including bilirubin and enzymes', 350.00, false, 0, 48, 'Light breakfast is permissible. Avoid fatty foods', true),
('Kidney Function Test (RFT)', 'Nephrology', 'Measures creatinine, BUN, and uric acid levels', 280.00, false, 0, 36, 'No specific preparation needed', true);

-- ========== INSERT USERS WITH CORRECT ROLES ==========
-- Patient user for testing booking creation
INSERT INTO users (name, email, password, role, phone, address, gender, blood_group, date_of_birth, is_active, created_at, updated_at)
VALUES ('Patient User', 'patient@test.com', '$2a$10$slYQmyNdGziq3wjgkkAL.e8VLdHdnI1OJ1lIuggdP70Y80vQiKRh2', 'PATIENT', '9876543210', '123 Patient Street', 'MALE', 'O+', '1990-01-15', true, NOW(), NOW());

-- Technician user for testing report submission (CORRECT ROLE)
INSERT INTO users (name, email, password, role, phone, address, gender, blood_group, date_of_birth, is_active, created_at, updated_at)
VALUES ('Technician User', 'technician@test.com', '$2a$10$slYQmyNdGziq3wjgkkAL.e8VLdHdnI1OJ1lIuggdP70Y80vQiKRh2', 'TECHNICIAN', '9876543211', '456 Lab Tech Avenue', 'FEMALE', 'B+', '1992-05-20', true, NOW(), NOW());

-- Medical Officer user for testing approvals (CORRECT ROLE)
INSERT INTO users (name, email, password, role, phone, address, gender, blood_group, date_of_birth, is_active, created_at, updated_at)
VALUES ('Medical Officer User', 'doctor@test.com', '$2a$10$slYQmyNdGziq3wjgkkAL.e8VLdHdnI1OJ1lIuggdP70Y80vQiKRh2', 'MEDICAL_OFFICER', '9876543212', '789 Doctor Plaza', 'MALE', 'AB+', '1985-08-30', true, NOW(), NOW());

-- ========== NOTES ==========
-- Password hash is for "password123" using BCrypt
-- Roles: PATIENT, TECHNICIAN, MEDICAL_OFFICER
-- All users have is_active=true
-- All lab tests have is_active=true
