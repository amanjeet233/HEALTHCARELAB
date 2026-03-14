CREATE TABLE doctor_availability (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    doctor_id BIGINT NOT NULL,
    day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INT DEFAULT 30, -- minutes
    break_start TIME NULL,
    break_end TIME NULL,
    is_available BOOLEAN DEFAULT true,
    consultation_type ENUM('VIDEO', 'AUDIO', 'CHAT', 'IN_PERSON') DEFAULT 'VIDEO',
    max_patients_per_slot INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_day_of_week (day_of_week),
    UNIQUE KEY unique_doctor_day (doctor_id, day_of_week, start_time)
);

-- Consultations table
CREATE TABLE consultations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    availability_slot_id BIGINT,
    consultation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type ENUM('VIDEO', 'AUDIO', 'CHAT', 'IN_PERSON') NOT NULL,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW') DEFAULT 'SCHEDULED',
    meeting_link VARCHAR(500),
    notes TEXT,
    prescription_url VARCHAR(500),
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (availability_slot_id) REFERENCES doctor_availability(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_consultation_date (consultation_date),
    INDEX idx_status (status)
);
