CREATE TABLE lab_locations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'USA',
    pincode VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(100),
    working_hours TEXT, -- JSON format for complex schedules
    facilities JSON, -- Array of facilities (parking, wheelchair, etc.)
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_home_collection_available BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city (city),
    INDEX idx_is_active (is_active),
    INDEX idx_coordinates (latitude, longitude),
    FULLTEXT INDEX ft_address (name, address, city)
);
