-- Table: lab_locations
CREATE TABLE IF NOT EXISTS lab_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: user_health_data
CREATE TABLE IF NOT EXISTS user_health_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    blood_group VARCHAR(10),
    height DECIMAL(5, 2),
    weight DECIMAL(5, 2),
    allergies TEXT,
    chronic_conditions TEXT,
    current_medications TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_health_data_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: doctor_availability
CREATE TABLE IF NOT EXISTS doctor_availability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    location_id BIGINT,
    day_of_week VARCHAR(15) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT DEFAULT 30,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctor_availability_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor_availability_location FOREIGN KEY (location_id) REFERENCES lab_locations(id) ON DELETE SET NULL
);

-- Table: consultations
CREATE TABLE IF NOT EXISTS consultations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    location_id BIGINT,
    scheduled_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    notes TEXT,
    prescription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_consultations_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_consultations_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_consultations_location FOREIGN KEY (location_id) REFERENCES lab_locations(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_user_health_data_user_id ON user_health_data(user_id);
CREATE INDEX idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);
CREATE INDEX idx_doctor_availability_location_id ON doctor_availability(location_id);
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_consultations_location_id ON consultations(location_id);
