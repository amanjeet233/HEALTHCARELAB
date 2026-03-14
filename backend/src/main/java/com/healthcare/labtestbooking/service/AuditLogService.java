package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.AuditLog;
import com.healthcare.labtestbooking.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public Page<AuditLog> getAllLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByUser(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findByUsernameOrderByTimestampDesc(username, pageable);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getLogsByEntity(String entityName, String entityId) {
        return auditLogRepository.findByEntityNameAndEntityIdOrderByTimestampDesc(entityName, entityId);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByDateRange(LocalDate from, LocalDate to, int page, int size) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(start, end, pageable);
    }
    
    // Additional generic logging capability for reuse across application
    @Transactional
    public AuditLog logAction(Long userId, String username, String action, String entityName, String entityId, String oldValue, String newValue) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setUsername(username);
        auditLog.setAction(action);
        auditLog.setEntityName(entityName);
        auditLog.setEntityId(entityId);
        auditLog.setOldValue(oldValue);
        auditLog.setNewValue(newValue);
        auditLog.setTimestamp(LocalDateTime.now());
        
        log.info("Audit log entry created: User={}, Action={}, Entity={} ({})", username, action, entityName, entityId);
        return auditLogRepository.save(auditLog);
    }
}
