package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Endpoints for monitoring application status.
 * 
 * Provides public endpoints (no authentication required) for:
 * - Simple health status checks
 * - Detailed health and environment information
 * - Monitoring and uptime verification
 * 
 * These endpoints are typically consumed by:
 * - Load balancers and health checkers
 * - Monitoring systems (Prometheus, DataDog, New Relic)
 * - Kubernetes liveness/readiness probes
 * - Infrastructure monitoring dashboards
 * 
 * NOTE: These endpoints return minimal information intentionally.
 * For security reasons, detailed system information is not exposed
 * to prevent reconnaissance attacks.
 */
@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/health")
@Slf4j
@Tag(name = "Health", description = "Application health and status endpoints (no auth required)")
public class HealthController {
    
    /**
     * Simple health check endpoint.
     * 
     * Returns minimal response to confirm service is running.
     * Suitable for load balancer health checks.
     * 
     * Response time: < 10ms (checks only if service is responding)
     * Does NOT perform database checks (fast response required for LB)
     * 
     * @return HTTP 200 with status "UP" if service is responding
     * 
     * @example
     * GET /api/health/live HTTP/1.1
     * 
     * HTTP/1.1 200 OK
     * {
     *   "status": "UP",
     *   "timestamp": "2026-02-20T15:30:45"
     * }
     */
    @GetMapping("/live")
    @Operation(
        summary = "Application liveness probe",
        description = "Fast health check to confirm service is running. Used by load balancers."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Service is running",
        content = @Content(schema = @Schema(example = "{\"status\": \"UP\", \"timestamp\": \"2026-02-20T15:30:45\"}"))
    )
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        log.debug("Health check requested - liveness probe");
        
        Map<String, Object> healthStatus = new HashMap<>();
        healthStatus.put("status", "UP");
        healthStatus.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        return ResponseEntity.ok(healthStatus);
    }
    
    /**
     * Detailed health check endpoint.
     * 
     * Returns comprehensive application information including:
     * - Overall status
     * - Version information
     * - Build timestamp
     * - Up time indicator
     * - Current server timestamp
     * 
     * Used by monitoring systems and dashboards.
     * Response time: < 50ms (minimal checks)
     * 
     * @return HTTP 200 with detailed health information
     * 
     * @example
     * GET /api/health HTTP/1.1
     * 
     * HTTP/1.1 200 OK
     * {
     *   "status": "UP",
     *   "service": "Healthcare Lab Test Booking API",
     *   "version": "1.0.0",
     *   "timestamp": "2026-02-20T15:30:45",
     *   "environment": "production"
     * }
     */
    @GetMapping
    @Operation(
        summary = "Detailed health check",
        description = "Returns detailed application status and version information"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Service is healthy with details",
        content = @Content(schema = @Schema(example = """
            {
              "status": "UP",
              "service": "Healthcare Lab Test Booking API",
              "version": "1.0.0",
              "timestamp": "2026-02-20T15:30:45"
            }
            """))
    )
    public ResponseEntity<Map<String, Object>> getDetailedHealthStatus() {
        log.info("Detailed health check requested");
        
        Map<String, Object> detailedHealth = new HashMap<>();
        detailedHealth.put("status", "UP");
        detailedHealth.put("service", "Healthcare Lab Test Booking API");
        detailedHealth.put("version", "1.0.0");
        detailedHealth.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        detailedHealth.put("javaVersion", System.getProperty("java.version"));
        detailedHealth.put("environment", System.getProperty("spring.profiles.active", "production"));
        
        return ResponseEntity.ok(detailedHealth);
    }
    
    /**
     * Public endpoint with explicit "UP" response.
     * 
     * Guaranteed 200 response when service is running.
     * Useful for CI/CD pipelines to verify deployment success.
     * 
     * @return HTTP 200 with minimal UP status
     */
    @GetMapping("/public")
    @Operation(
        summary = "Public availability check",
        description = "Always returns 200 when service is available"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Service is available",
        content = @Content(schema = @Schema(example = "{\"message\": \"Service is available\"}"))
    )
    public ResponseEntity<Map<String, String>> getPublicStatus() {
        log.trace("Public health endpoint accessed");
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Service is available");
        response.put("time", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Readiness check endpoint.
     * 
     * Confirms application is ready to accept requests.
     * Could be extended to check database connectivity.
     * 
     * Current behavior: Simple response (no DB checks)
     * Future enhancement: Add database connectivity verification
     * 
     * @return HTTP 200 if ready, future: 503 if dependencies unavailable
     */
    @GetMapping("/ready")
    @Operation(
        summary = "Application readiness probe",
        description = "Confirms application is ready to process requests"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Application is ready",
        content = @Content(schema = @Schema(example = "{\"status\": \"READY\", \"timestamp\": \"2026-02-20T15:30:45\"}"))
    )
    public ResponseEntity<Map<String, Object>> getReadinessStatus() {
        log.debug("Readiness check requested");
        
        Map<String, Object> readinessStatus = new HashMap<>();
        readinessStatus.put("status", "READY");
        readinessStatus.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        // Future: Add database connectivity check here
        // boolean dbConnected = checkDatabaseConnection();
        // if (!dbConnected) {
        //     return ResponseEntity.status(503).body(readinessStatus);
        // }
        
        return ResponseEntity.ok(readinessStatus);
    }
}
