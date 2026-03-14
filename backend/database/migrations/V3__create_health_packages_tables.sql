-- Health packages table
CREATE TABLE health_packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    package_name VARCHAR(200) NOT NULL,
    package_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    popular BOOLEAN DEFAULT false,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_package_name (package_name),
    INDEX idx_is_active (is_active)
);

-- Package tests junction table
CREATE TABLE package_tests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    package_id BIGINT NOT NULL,
    test_id BIGINT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES health_packages(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES lab_tests(id) ON DELETE CASCADE,
    UNIQUE KEY unique_package_test (package_id, test_id),
    INDEX idx_package_id (package_id),
    INDEX idx_test_id (test_id)
);

-- Package bookings relation
ALTER TABLE bookings ADD COLUMN package_id BIGINT NULL;
ALTER TABLE bookings ADD CONSTRAINT fk_booking_package FOREIGN KEY (package_id) REFERENCES health_packages(id);
