CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CARD', 'UPI', 'NETBANKING', 'WALLET', 'CASH') NOT NULL,
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED') DEFAULT 'PENDING',
    transaction_id VARCHAR(100) UNIQUE,
    payment_date TIMESTAMP NULL,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_reason TEXT,
    gateway_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_id (transaction_id)
);
