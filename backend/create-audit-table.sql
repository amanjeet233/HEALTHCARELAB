USE healthcare_lab_db;

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entity_name VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    username VARCHAR(100),
    user_id BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_entity (entity_name, entity_id),
    KEY idx_timestamp (timestamp)
);

/* Verify table creation */
SHOW TABLES LIKE 'audit_logs';
SELECT COUNT(*) as 'audit_logs rows' FROM audit_logs;
