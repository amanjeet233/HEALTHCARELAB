-- Add composite index for frequently queried bookings table
DELIMITER $$
CREATE PROCEDURE AddIndexIfNotExists(
    IN tableName VARCHAR(128),
    IN indexName VARCHAR(128),
    IN indexColumns VARCHAR(256)
)
BEGIN
    DECLARE indexCount INT;
    
    SELECT COUNT(1) INTO indexCount
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = tableName
      AND index_name = indexName;
      
    IF indexCount = 0 THEN
        SET @sql = CONCAT('CREATE INDEX ', indexName, ' ON ', tableName, '(', indexColumns, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$
DELIMITER ;

CALL AddIndexIfNotExists('bookings', 'idx_bookings_patient_status', 'patient_id, status');
CALL AddIndexIfNotExists('reports', 'idx_reports_booking_id', 'booking_id');
CALL AddIndexIfNotExists('payments', 'idx_payments_booking_id', 'booking_id');

DROP PROCEDURE AddIndexIfNotExists;

-- Ensure Foreign Keys on bookings
DELIMITER $$
CREATE PROCEDURE AddFKIfNotExists(
    IN tableName VARCHAR(128),
    IN constraintName VARCHAR(128),
    IN fkDetails VARCHAR(512)
)
BEGIN
    DECLARE fkCount INT;
    
    SELECT COUNT(1) INTO fkCount
    FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = tableName
      AND constraint_name = constraintName
      AND constraint_type = 'FOREIGN KEY';
      
    IF fkCount = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' ADD CONSTRAINT ', constraintName, ' ', fkDetails);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$
DELIMITER ;

CALL AddFKIfNotExists('reports', 'fk_reports_booking_id', 'FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE');
CALL AddFKIfNotExists('payments', 'fk_payments_booking_id', 'FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE');

DROP PROCEDURE AddFKIfNotExists;
