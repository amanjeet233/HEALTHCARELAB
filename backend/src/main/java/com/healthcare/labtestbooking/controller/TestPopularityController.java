package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.TestPopularity;
import com.healthcare.labtestbooking.service.TestPopularityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-popularity")
@RequiredArgsConstructor
@Tag(name = "Test Popularity", description = "Lab test popularity statistics")
public class TestPopularityController {

    private final TestPopularityService testPopularityService;

    @GetMapping
    @Operation(summary = "Get all test popularity stats")
    public ResponseEntity<ApiResponse<List<TestPopularity>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Popularity stats fetched successfully",
                testPopularityService.getPopularityStats()));
    }

    @PostMapping("/increment/{testId}")
    @Operation(summary = "Increment popularity for a test")
    public ResponseEntity<ApiResponse<TestPopularity>> increment(@PathVariable Long testId) {
        return ResponseEntity
                .ok(ApiResponse.success("Popularity incremented", testPopularityService.incrementPopularity(testId)));
    }
}
