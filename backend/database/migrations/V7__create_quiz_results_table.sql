CREATE TABLE quiz_results (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    quiz_type VARCHAR(50) DEFAULT 'VITALITY_ASSESSMENT',
    answers JSON NOT NULL, -- Store all answers as JSON
    recommendations JSON, -- Store recommendations as JSON
    risk_factors JSON, -- Identified risk factors
    health_score INT, -- 0-100 score
    suggested_tests JSON, -- Recommended tests based on answers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
