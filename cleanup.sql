-- Delete existing test users to fix 409 Conflict in Postman tests
DELETE FROM users WHERE email IN ('patient@test.com', 'doctor@test.com', 'technician@test.com', 'patient.test@unique.com', 'doctor.test@unique.com', 'technician.test@unique.com');

-- Alternatively, simply deactivate them:
-- UPDATE users SET is_active = false WHERE email IN ('patient@test.com', 'doctor@test.com', 'technician@test.com');
