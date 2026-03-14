CREATE TABLE reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT UNIQUE NOT NULL,
    report_url VARCHAR(500) NOT NULL,
    report_file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT false,
    verified_by BIGINT,
    verified_date TIMESTAMP NULL,
    report_data JSON, -- For structured report data
    pdf_password VARCHAR(255), -- For protected PDFs
    download_count INT DEFAULT 0,
    last_downloaded TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_is_verified (is_verified)
);
