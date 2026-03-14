CREATE TABLE user_health_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    age INT,
    date_of_birth DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),
    weight DECIMAL(5,2), -- in kg
    height DECIMAL(5,2), -- in cm
    blood_group VARCHAR(5),
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    heart_rate INT,
    allergies TEXT, -- JSON array
    chronic_conditions TEXT, -- JSON array
    medications TEXT, -- JSON array of current medications
    surgeries TEXT, -- JSON array of past surgeries
    family_history TEXT, -- JSON array
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    dietary_preferences TEXT, -- JSON array
    lifestyle_factors TEXT, -- JSON array (smoking, alcohol, exercise)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_blood_group (blood_group)
);
