package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.ChartDataDTO;
import com.healthcare.labtestbooking.dto.Period;
import com.healthcare.labtestbooking.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Analytics", description = "Analytics and dashboard data for administrators")
@SecurityRequirement(name = "bearerAuth")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/daily-bookings")
    @Operation(summary = "Get daily bookings", description = "Retrieve daily booking statistics for a date range (ADMIN role required)")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Daily bookings data fetched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid date range"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<ChartDataDTO>> getDailyBookings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        ChartDataDTO data = analyticsService.getDailyBookings(start, end);
        return ResponseEntity.ok(ApiResponse.success("Daily bookings fetched", data));
    }

    @GetMapping("/popular-tests")
    @Operation(summary = "Get popular tests", description = "Retrieve most popular lab tests by booking count (ADMIN role required)")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Popular tests data fetched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid limit parameter"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<ChartDataDTO>> getPopularTests(
            @RequestParam(defaultValue = "10") int limit) {
        ChartDataDTO data = analyticsService.getPopularTests(limit);
        return ResponseEntity.ok(ApiResponse.success("Popular tests fetched", data));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get revenue analytics", description = "Retrieve revenue data by period (DAILY or MONTHLY) (ADMIN role required)")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Revenue analytics fetched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid period parameter"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<ChartDataDTO>> getRevenue(
            @RequestParam(required = false) Period period) {
        ChartDataDTO data = analyticsService.getRevenueByPeriod(period);
        return ResponseEntity.ok(ApiResponse.success("Revenue analytics fetched", data));
    }

    @GetMapping("/user-growth")
    @Operation(summary = "Get user growth", description = "Retrieve user registration growth by period (DAILY or MONTHLY) (ADMIN role required)")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User growth data fetched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid period parameter"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<ChartDataDTO>> getUserGrowth(
            @RequestParam(required = false) Period period) {
        ChartDataDTO data = analyticsService.getUserGrowth(period);
        return ResponseEntity.ok(ApiResponse.success("User growth analytics fetched", data));
    }

    @GetMapping("/cancellation-rate")
    @Operation(summary = "Get cancellation rate", description = "Retrieve booking cancellation rate analytics (ADMIN role required)")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cancellation rate data fetched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<ChartDataDTO>> getCancellationRate() {
        ChartDataDTO data = analyticsService.getCancellationRate();
        return ResponseEntity.ok(ApiResponse.success("Cancellation rate fetched", data));
    }
}

