package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.HealthMetric;
import com.healthcare.labtestbooking.service.HealthInsightsService;
import com.healthcare.labtestbooking.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/health-insights")
@RequiredArgsConstructor
@Tag(name = "Health Insights", description = "Personal health metrics and trends")
@SecurityRequirement(name = "bearerAuth")
public class HealthInsightsController {

    private final HealthInsightsService healthInsightsService;
    private final UserService userService;

    @GetMapping("/latest")
    @Operation(summary = "Get latest health metrics", description = "Retrieve the latest measurements for key health parameters")
    public ResponseEntity<ApiResponse<List<HealthMetric>>> getLatestMetrics() {
        Long userId = userService.getCurrentUserId();
        List<HealthMetric> metrics = healthInsightsService.getLatestMetrics(userId);
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    @GetMapping("/trends")
    @Operation(summary = "Get health trends", description = "Retrieve historical data for health metrics grouped by type")
    public ResponseEntity<ApiResponse<Map<String, List<HealthMetric>>>> getMetricTrends() {
        Long userId = userService.getCurrentUserId();
        Map<String, List<HealthMetric>> trends = healthInsightsService.getMetricTrends(userId);
        return ResponseEntity.ok(ApiResponse.success(trends));
    }

    @GetMapping("/overview")
    @Operation(summary = "Get aggregated health insights", description = "Retrieve latest and trend data in one payload")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        Long userId = userService.getCurrentUserId();
        List<HealthMetric> latest = healthInsightsService.getLatestMetrics(userId);
        Map<String, List<HealthMetric>> trends = healthInsightsService.getMetricTrends(userId);

        Map<String, Object> payload = Map.of(
                "latest", latest,
                "trends", trends
        );
        return ResponseEntity.ok(ApiResponse.success(payload));
    }

    @GetMapping("/metrics")
    @Operation(summary = "Get health metrics list", description = "Filter metrics by optional metric type")
    public ResponseEntity<ApiResponse<List<HealthMetric>>> getMetrics(
            @RequestParam(required = false) String metricType) {
        Long userId = userService.getCurrentUserId();
        Map<String, List<HealthMetric>> trends = healthInsightsService.getMetricTrends(userId);
        if (metricType != null && !metricType.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(trends.getOrDefault(metricType, List.of())));
        }
        List<HealthMetric> flattened = trends.values().stream().flatMap(List::stream).toList();
        return ResponseEntity.ok(ApiResponse.success(flattened));
    }
}
