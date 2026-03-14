-- =============================================
-- Steps 5-10: New table migrations
-- =============================================

-- 1. Quiz Results table
CREATE TABLE IF NOT EXISTS quiz_results (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    quiz_type VARCHAR(50) DEFAULT 'HEALTH_ASSESSMENT',
    answers_json JSON NOT NULL,
    score INT,
    recommendations_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_quiz_user (user_id),
    INDEX idx_quiz_created (created_at)
);

-- 2. Notifications table (persistent inbox)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_unread (user_id, is_read),
    INDEX idx_notif_created (created_at)
);

SELECT 'Steps 5-10 migration completed!' AS Status;
