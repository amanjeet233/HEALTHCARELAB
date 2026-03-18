package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.LabPartner;
import com.healthcare.labtestbooking.service.LabService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/labs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Lab Management", description = "Lab partner lookup, comparison, and best deals")
@SecurityRequirement(name = "bearerAuth")
public class LabController {

    private final LabService labService;

    @GetMapping("/nearby")
    @Operation(summary = "Get nearby labs", description = "Find labs within a specified radius using GPS coordinates (Haversine formula)")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Labs found successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid coordinates or radius"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNearbyLabs(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radius) {
        log.info("GET /api/labs/nearby - lat: {}, lng: {}, radius: {}km", lat, lng, radius);
        List<Map<String, Object>> labs = labService.getNearbyLabs(lat, lng, radius);
        return ResponseEntity.ok(ApiResponse.success("Found " + labs.size() + " labs within " + radius + "km", labs));
    }

    @GetMapping("/city/{city}")
    @Operation(summary = "Get labs by city", description = "Get all active labs in a specific city")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Labs retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No labs found in city"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<List<LabPartner>>> getLabsByCity(@PathVariable String city) {
        log.info("GET /api/labs/city/{}", city);
        List<LabPartner> labs = labService.getLabsByCity(city);
        return ResponseEntity.ok(ApiResponse.success("Found " + labs.size() + " labs in " + city, labs));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get lab by ID", description = "Get detailed information about a specific lab partner")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lab found successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Lab not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<LabPartner>> getLabById(@PathVariable Long id) {
        log.info("GET /api/labs/{}", id);
        LabPartner lab = labService.getLabById(id);
        return ResponseEntity.ok(ApiResponse.success("Lab fetched successfully", lab));
    }

    @GetMapping("/compare/{testId}")
    @Operation(summary = "Compare prices", description = "Compare prices for a specific test across all labs")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Price comparison retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Test not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> comparePrices(@PathVariable Long testId) {
        log.info("GET /api/labs/compare/{}", testId);
        List<Map<String, Object>> comparisons = labService.comparePrices(testId);
        return ResponseEntity.ok(ApiResponse.success("Price comparison for " + comparisons.size() + " labs", comparisons));
    }

    @GetMapping("/best-deal/{testId}")
    @Operation(summary = "Get best deal", description = "Find the cheapest lab for a specific test")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Best deal found successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No pricing found for test"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBestDeal(@PathVariable Long testId) {
        log.info("GET /api/labs/best-deal/{}", testId);
        Map<String, Object> bestDeal = labService.getBestDeal(testId);
        return ResponseEntity.ok(ApiResponse.success("Best deal found", bestDeal));
    }
}
