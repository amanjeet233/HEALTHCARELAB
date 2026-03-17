package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.AuditLog;
import com.healthcare.labtestbooking.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public AuditLog saveAuditLog(AuditLog auditLog) {
        log.info("Saving audit log for entity: {} with action: {}", auditLog.getEntityName(), auditLog.getAction());
        return auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAuditLogsForEntity(String entityName, String entityId) {
        return auditLogRepository.findByEntityNameAndEntityId(entityName, entityId);
    }

    public List<AuditLog> getAuditLogsForUser(Long userId) {
        return auditLogRepository.findByUserId(userId);
    }

    public List<AuditLog> getAuditLogsInTimeRange(LocalDateTime start, LocalDateTime end) {
        return auditLogRepository.findByTimestampBetween(start, end);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }
}
