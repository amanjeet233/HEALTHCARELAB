CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type ENUM('BOOKING', 'PAYMENT', 'REPORT', 'REMINDER', 'PROMO', 'ALERT', 'SYSTEM') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON, -- Additional data (booking_id, report_id, etc.)
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL,
    is_archived BOOLEAN DEFAULT false,
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
    image_url VARCHAR(500),
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type)
);
