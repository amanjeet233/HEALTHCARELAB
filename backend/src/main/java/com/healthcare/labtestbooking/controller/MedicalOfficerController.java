package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.ReportVerificationRequest;
import com.healthcare.labtestbooking.dto.ReportVerificationResponse;
import com.healthcare.labtestbooking.service.MedicalOfficerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mo")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MEDICAL_OFFICER')")
public class MedicalOfficerController {

    private final MedicalOfficerService medicalOfficerService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ReportVerificationResponse>>> getPendingVerifications() {
        List<ReportVerificationResponse> verifications = medicalOfficerService.getPendingVerifications();
        return ResponseEntity.ok(ApiResponse.success(verifications));
    }

    @GetMapping("/pending/count")
    public ResponseEntity<ApiResponse<Integer>> getPendingVerificationsCount() {
        int count = medicalOfficerService.getPendingVerifications().size();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PostMapping("/verify/{bookingId}")
    public ResponseEntity<ApiResponse<ReportVerificationResponse>> verifyReport(
            @PathVariable Long bookingId,
            @Valid @RequestBody ReportVerificationRequest request) {
        ReportVerificationResponse response = medicalOfficerService.verifyReport(bookingId, request);
        return ResponseEntity.ok(ApiResponse.success("Report verified", response));
    }

    @PostMapping("/reject/{bookingId}")
    public ResponseEntity<ApiResponse<ReportVerificationResponse>> rejectReport(
            @PathVariable Long bookingId,
            @Valid @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "No reason provided");
        ReportVerificationResponse response = medicalOfficerService.rejectReport(bookingId, reason);
        return ResponseEntity.ok(ApiResponse.success("Report rejected", response));
    }

    @PostMapping("/icd-codes/{bookingId}")
    public ResponseEntity<ApiResponse<ReportVerificationResponse>> addICDCodes(
            @PathVariable Long bookingId,
            @Valid @RequestBody List<String> icdCodes) {
        ReportVerificationResponse response = medicalOfficerService.addICDCodes(bookingId, icdCodes);
        return ResponseEntity.ok(ApiResponse.success("ICD codes added", response));
    }

    @PostMapping("/referral/{bookingId}")
    public ResponseEntity<ApiResponse<Void>> createReferral(
            @PathVariable Long bookingId,
            @Valid @RequestBody Map<String, String> body) {
        String specialistType = body.getOrDefault("specialistType", "General");
        String referralNotes = body.getOrDefault("notes", "");
        medicalOfficerService.referToSpecialist(bookingId, specialistType, referralNotes);
        return ResponseEntity.ok(ApiResponse.success("Referral created", null));
    }
}
