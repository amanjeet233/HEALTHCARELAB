-- Add columns to users table
ALTER TABLE users 
ADD COLUMN profile_picture VARCHAR(500),
ADD COLUMN email_verified BOOLEAN DEFAULT false,
ADD COLUMN phone_verified BOOLEAN DEFAULT false,
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN last_login TIMESTAMP NULL,
ADD COLUMN login_attempts INT DEFAULT 0,
ADD COLUMN lock_until TIMESTAMP NULL,
ADD COLUMN preferences JSON; -- JSON for notification preferences, theme, etc.

-- Add columns to lab_tests table
ALTER TABLE lab_tests
ADD COLUMN preparation_instructions TEXT,
ADD COLUMN sample_type VARCHAR(100),
ADD COLUMN container_type VARCHAR(100),
ADD COLUMN volume_required VARCHAR(50),
ADD COLUMN storage_conditions VARCHAR(255),
ADD COLUMN turnaround_hours INT,
ADD COLUMN home_collection_available BOOLEAN DEFAULT true,
ADD COLUMN popular BOOLEAN DEFAULT false,
ADD COLUMN view_count INT DEFAULT 0,
ADD COLUMN rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN review_count INT DEFAULT 0;

-- Add columns to bookings table
ALTER TABLE bookings
ADD COLUMN is_priority BOOLEAN DEFAULT false,
ADD COLUMN priority_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN reschedule_count INT DEFAULT 0,
ADD COLUMN cancelled_by BIGINT,
ADD COLUMN cancellation_reason VARCHAR(255),
ADD COLUMN cancellation_time TIMESTAMP NULL,
ADD COLUMN reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN reminder_time TIMESTAMP NULL,
ADD COLUMN feedback TEXT,
ADD COLUMN rating INT; -- 1-5 star rating
