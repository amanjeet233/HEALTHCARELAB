package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.AuditLog;
import com.healthcare.labtestbooking.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Audit Logs", description = "Admin audit log viewing (ADMIN role required)")
@SecurityRequirement(name = "bearerAuth")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get all audit logs", description = "Paginated list of all audit logs, newest first")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<AuditLog> logs = auditLogService.getAllLogs(page, size);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/user/{username}")
    @Operation(summary = "Get logs by user", description = "Get audit logs for a specific user")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getLogsByUser(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<AuditLog> logs = auditLogService.getLogsByUser(username, page, size);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/entity/{entityName}/{entityId}")
    @Operation(summary = "Get logs by entity", description = "Get audit trail for a specific entity")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getLogsByEntity(
            @PathVariable String entityName,
            @PathVariable String entityId) {
        List<AuditLog> logs = auditLogService.getLogsByEntity(entityName, entityId);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get logs by date range", description = "Get audit logs within a date range")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<AuditLog> logs = auditLogService.getLogsByDateRange(from, to, page, size);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
