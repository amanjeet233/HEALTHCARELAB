package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.Recommendation;
import com.healthcare.labtestbooking.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendations", description = "Health and test recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    @Operation(summary = "Get all recommendations")
    public ResponseEntity<ApiResponse<List<Recommendation>>> getAllRecommendations() {
        return ResponseEntity.ok(ApiResponse.success("Recommendations fetched successfully",
                recommendationService.getAllRecommendations()));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get recommendation for a specific booking")
    public ResponseEntity<ApiResponse<Recommendation>> getByBookingId(@PathVariable Long bookingId) {
        return recommendationService.getRecommendationByBookingId(bookingId)
                .map(r -> ResponseEntity.ok(ApiResponse.success("Recommendation found", r)))
                .orElse(ResponseEntity.ok(ApiResponse.success("No recommendation for this booking", null)));
    }
}
