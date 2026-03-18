package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.service.SmartReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Smart Reports", description = "AI-powered report analysis and insights")
@SecurityRequirement(name = "bearerAuth")
public class SmartReportController {

    private final SmartReportService smartReportService;

    @GetMapping("/{id}/smart")
    @Operation(summary = "Get smart analysis", description = "Get AI-powered analysis with health score and recommendations")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Analysis generated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking or report not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSmartAnalysis(@PathVariable Long id) {
        log.info("GET /api/reports/{}/smart - Generating smart analysis", id);
        Map<String, Object> analysis = smartReportService.getSmartAnalysis(id);
        return ResponseEntity.ok(ApiResponse.success("Smart analysis generated", analysis));
    }

    @GetMapping("/{id}/trends/{testId}")
    @Operation(summary = "Get parameter trends", description = "Get historical trends for test parameters across multiple reports")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Trends retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> getParameterTrends(
            @PathVariable Long id,
            @PathVariable Long testId) {
        log.info("GET /api/reports/{}/trends/{} - Getting parameter trends", id, testId);
        Map<String, Object> trends = smartReportService.getParameterTrend(id, testId);
        return ResponseEntity.ok(ApiResponse.success("Parameter trends retrieved", trends));
    }

    @GetMapping("/{id}/critical")
    @Operation(summary = "Get critical values", description = "Get all critical and abnormal values requiring attention")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Critical values retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking or report not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCriticalValues(@PathVariable Long id) {
        log.info("GET /api/reports/{}/critical - Getting critical values", id);
        Map<String, Object> criticalValues = smartReportService.getCriticalValues(id);
        return ResponseEntity.ok(ApiResponse.success("Critical values retrieved", criticalValues));
    }
}
