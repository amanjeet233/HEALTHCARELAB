package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.HealthMetric;
import com.healthcare.labtestbooking.service.HealthInsightsService;
import com.healthcare.labtestbooking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
public class UserHealthMetricsController {

    private final HealthInsightsService healthInsightsService;
    private final UserService userService;

    @GetMapping("/health-metrics")
    public ResponseEntity<ApiResponse<List<HealthMetric>>> getHealthMetrics(
            @RequestParam(required = false) String metricType) {
        Long userId = userService.getCurrentUserId();
        Map<String, List<HealthMetric>> trends = healthInsightsService.getMetricTrends(userId);
        if (metricType != null && !metricType.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(trends.getOrDefault(metricType, List.of())));
        }
        List<HealthMetric> flattened = trends.values().stream().flatMap(List::stream).toList();
        return ResponseEntity.ok(ApiResponse.success(flattened));
    }

    @GetMapping("/health-insights")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthInsights() {
        Long userId = userService.getCurrentUserId();
        Map<String, Object> payload = Map.of(
                "latest", healthInsightsService.getLatestMetrics(userId),
                "trends", healthInsightsService.getMetricTrends(userId)
        );
        return ResponseEntity.ok(ApiResponse.success(payload));
    }
}

