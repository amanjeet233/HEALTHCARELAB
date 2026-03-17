package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.service.ReportResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/report-results")
@RequiredArgsConstructor
@Tag(name = "Report Results", description = "Management of detailed test results")
public class ReportResultController {

    private final ReportResultService reportResultService;

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get test results for a specific booking")
    public ResponseEntity<ApiResponse<List<ReportResult>>> getByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success("Results fetched successfully",
                reportResultService.getResultsByBookingId(bookingId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific result entry by ID")
    public ResponseEntity<ApiResponse<ReportResult>> getById(@PathVariable Long id) {
        return reportResultService.getResultById(id)
                .map(r -> ResponseEntity.ok(ApiResponse.success("Result entry found", r)))
                .orElse(ResponseEntity.notFound().build());
    }
}
