package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.dto.DeltaCheckEntry;
import com.healthcare.labtestbooking.dto.ReportVerificationRequest;
import com.healthcare.labtestbooking.dto.ReportVerificationResponse;
import com.healthcare.labtestbooking.service.MedicalOfficerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mo")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MEDICAL_OFFICER')")
public class MedicalOfficerController {

    private final MedicalOfficerService medicalOfficerService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<Page<ReportVerificationResponse>>> getPendingVerifications(
            @RequestParam(required = false) String filter,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<ReportVerificationResponse> verifications = medicalOfficerService.getVerificationsByFilter(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(verifications));
    }

    @PutMapping("/flag-critical/{bookingId}")
    public ResponseEntity<ApiResponse<Void>> flagCritical(@PathVariable Long bookingId) {
        medicalOfficerService.flagCritical(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Booking flagged as critical", null));
    }

    @GetMapping("/pending/count")
    public ResponseEntity<ApiResponse<Integer>> getPendingVerificationsCount() {
        int count = (int) medicalOfficerService.getPendingVerificationsCount();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/delta-check")
    public ResponseEntity<ApiResponse<List<DeltaCheckEntry>>> getDeltaCheck(
            @RequestParam Long patientId,
            @RequestParam String testName) {
        List<DeltaCheckEntry> delta = medicalOfficerService.getDeltaCheck(patientId, testName);
        return ResponseEntity.ok(ApiResponse.success(delta));
    }

    @PostMapping({"/verify/{bookingId}", "/verify/{reportId}"})
    public ResponseEntity<ApiResponse<ReportVerificationResponse>> verifyReport(
            @PathVariable(value = "bookingId", required = false) Long bookingId,
            @PathVariable(value = "reportId", required = false) Long reportId,
            @Valid @RequestBody ReportVerificationRequest request) {

        Long idToUse = bookingId != null ? bookingId : reportId;
        ReportVerificationResponse response = medicalOfficerService.verifyReport(idToUse, request);
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

    // ── Technician Assignment by MO ───────────────────────────────────────────

    /**
     * POST /api/mo/assign-technician/{bookingId}
     * MO suggests a technician for a booking → sets MO_SUGGESTED + notifies technician.
     */
    @PostMapping("/assign-technician/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponse>> assignTechnicianByMo(
            @PathVariable Long bookingId,
            @RequestBody Map<String, Long> body) {
        Long technicianId = body.get("technicianId");
        if (technicianId == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("technicianId is required in the request body"));
        }
        BookingResponse response = medicalOfficerService.suggestTechnician(bookingId, technicianId);
        return ResponseEntity.ok(ApiResponse.success("Technician assigned by Medical Officer", response));
    }

    /**
     * GET /api/mo/bookings/unassigned
     * Returns all bookings with no technician (BOOKED / CONFIRMED), sorted by date asc.
     */
    @GetMapping("/bookings/unassigned")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getUnassignedBookings() {
        List<BookingResponse> bookings = medicalOfficerService.getUnassignedBookings();
        return ResponseEntity.ok(ApiResponse.success("Unassigned bookings fetched", bookings));
    }

    /**
     * GET /api/mo/technicians/available?date=YYYY-MM-DD
     * Returns active technicians with their booking count for the given date.
     */
    @GetMapping("/technicians/available")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTechniciansAvailableForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Map<String, Object>> technicians = medicalOfficerService.getTechniciansAvailableForDate(date);
        return ResponseEntity.ok(ApiResponse.success("Technicians fetched for date " + date, technicians));
    }

    @PostMapping("/amend/{reportId}")
    public ResponseEntity<ApiResponse<ReportVerificationResponse>> amendReport(
            @PathVariable Long reportId,
            @RequestBody Map<String, Object> body) {
        String reason = (String) body.get("amendmentReason");
        @SuppressWarnings("unchecked")
        Map<Long, String> newValues = (Map<Long, String>) body.get("newValues");
        if (newValues == null) newValues = Map.of();
        
        ReportVerificationResponse response = medicalOfficerService.amendReport(reportId, reason, newValues);
        return ResponseEntity.ok(ApiResponse.success("Report amended successfully", response));
    }

    @PostMapping("/panic-alert")
    public ResponseEntity<ApiResponse<Void>> logPanicAlert(@RequestBody Map<String, Object> body) {
        Long bookingId = Long.valueOf(body.get("bookingId").toString());
        String physicianName = (String) body.get("physicianName");
        String channel = (String) body.getOrDefault("channel", "Phone");
        String instructions = (String) body.get("physicianInstructions");
        
        medicalOfficerService.logPanicAlert(bookingId, physicianName, channel, instructions);
        return ResponseEntity.ok(ApiResponse.success("Panic alert logged", null));
    }
}
