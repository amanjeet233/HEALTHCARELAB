package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.service.ReportVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/report-verifications")
@RequiredArgsConstructor
@Tag(name = "Report Verifications", description = "Management of report medical verification status")
public class ReportVerificationController {

    private final ReportVerificationService reportVerificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    @Operation(summary = "Get all report verifications")
    public ResponseEntity<ApiResponse<List<ReportVerification>>> getAllVerifications() {
        return ResponseEntity.ok(ApiResponse.success("Verifications fetched successfully",
                reportVerificationService.getAllVerifications()));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get verification status for a specific booking")
    public ResponseEntity<ApiResponse<ReportVerification>> getByBookingId(@PathVariable Long bookingId) {
        return reportVerificationService.getVerificationByBookingId(bookingId)
                .map(v -> ResponseEntity.ok(ApiResponse.success("Verification info found", v)))
                .orElse(ResponseEntity.ok(ApiResponse.success("Not yet verified", null)));
    }
}
