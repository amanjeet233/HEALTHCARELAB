package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEntityNameAndEntityId(String entityName, String entityId);

    List<AuditLog> findByUserId(Long userId);

    List<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
