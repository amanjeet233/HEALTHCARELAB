package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByUsernameOrderByTimestampDesc(String username, Pageable pageable);

    List<AuditLog> findByEntityNameAndEntityIdOrderByTimestampDesc(String entityName, String entityId);

    Page<AuditLog> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
