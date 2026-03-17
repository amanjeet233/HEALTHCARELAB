package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.ReportResultDTO;
import com.healthcare.labtestbooking.dto.ReportResultRequest;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.service.ReportGeneratorService;
import com.healthcare.labtestbooking.service.ReportService;
import com.healthcare.labtestbooking.service.ReportResultService;
import com.healthcare.labtestbooking.service.ReportVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reports", description = "Lab test results and reports management")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;
    private final ReportGeneratorService reportGeneratorService;
    private final ReportResultService reportResultService;
    private final ReportVerificationService reportVerificationService;

    @PostMapping("/results")
    @PreAuthorize("hasRole('TECHNICIAN')")
    @Operation(summary = "Submit report results", description = "Submit lab test results for a booking (TECHNICIAN role required)")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Report results submitted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid report data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - TECHNICIAN role required"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<ReportResultDTO>> submitReportResults(
            @Valid @RequestBody ReportResultRequest request) {
        log.info("Received request to submit report results for booking: {}", request.getBookingId());
        ReportResultDTO result = reportService.enterReportResults(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Report results submitted successfully", result));
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'MEDICAL_OFFICER', 'TECHNICIAN')")
    @Operation(summary = "Get report by booking", description = "Retrieve lab test report for a specific booking")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Report fetched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report or booking not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<ReportResultDTO>> getReportByBooking(@PathVariable Long bookingId) {
        log.info("Fetching report for booking ID: {}", bookingId);
        ReportResultDTO report = reportService.getReportByBookingId(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Report fetched successfully", report));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<Void>> uploadReport(
            @RequestParam("bookingId") Long bookingId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        log.info("Uploading PDF report for booking ID: {}", bookingId);
        reportService.uploadReport(bookingId, file);
        return ResponseEntity.ok(ApiResponse.success("Report uploaded successfully", null));
    }

    @PostMapping("/verify/{id}")
    @PreAuthorize("hasAnyRole('MEDICAL_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> verifyReport(@PathVariable Long id) {
        log.info("Verifying report ID: {}", id);
        reportService.verifyReport(id);
        return ResponseEntity.ok(ApiResponse.success("Report verified successfully", null));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Page<ReportResultDTO>>> getMyReports(@PageableDefault(size = 20) Pageable pageable) {
        log.info("Fetching reports for current patient");
        Page<ReportResultDTO> reports = reportService.getMyReports(pageable);
        return ResponseEntity.ok(ApiResponse.success("Reports fetched successfully", reports));
    }

    @GetMapping("/{bookingId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'MEDICAL_OFFICER', 'TECHNICIAN')")
    @Operation(summary = "Get report by booking", description = "Retrieve lab test report for a specific booking")
    public ResponseEntity<ApiResponse<ReportResultDTO>> getReportByBookingId(@PathVariable Long bookingId) {
        log.info("Fetching report for booking ID: {}", bookingId);
        ReportResultDTO report = reportService.getReportByBookingId(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Report fetched successfully", report));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('PATIENT', 'MEDICAL_OFFICER', 'TECHNICIAN', 'ADMIN')")
    @Operation(summary = "Get report PDF", description = "Download lab test report as PDF with QR code for verification")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "PDF generated and downloaded successfully", content = @Content(mediaType = "application/pdf")),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error or PDF generation failed")
    })
    public ResponseEntity<byte[]> getReportPdf(@PathVariable Long id) {
        log.info("Generating PDF report for report ID: {}", id);
        byte[] pdf = reportGeneratorService.generatePdfReport(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/results/booking/{bookingId}")
    @Operation(summary = "Get test results for a specific booking")
    public ResponseEntity<ApiResponse<List<ReportResult>>> getResultsByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success("Results fetched successfully",
                reportResultService.getResultsByBookingId(bookingId)));
    }

    @GetMapping("/results/{id}")
    @Operation(summary = "Get specific result entry by ID")
    public ResponseEntity<ApiResponse<ReportResult>> getResultById(@PathVariable Long id) {
        return reportResultService.getResultById(id)
                .map(r -> ResponseEntity.ok(ApiResponse.success("Result entry found", r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/verifications")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    @Operation(summary = "Get all report verifications")
    public ResponseEntity<ApiResponse<List<ReportVerification>>> getAllVerifications() {
        return ResponseEntity.ok(ApiResponse.success("Verifications fetched successfully",
                reportVerificationService.getAllVerifications()));
    }

    @GetMapping("/verifications/booking/{bookingId}")
    @Operation(summary = "Get verification status for a specific booking")
    public ResponseEntity<ApiResponse<ReportVerification>> getVerificationByBooking(@PathVariable Long bookingId) {
        return reportVerificationService.getVerificationByBookingId(bookingId)
                .map(v -> ResponseEntity.ok(ApiResponse.success("Verification info found", v)))
                .orElse(ResponseEntity.ok(ApiResponse.success("Not yet verified", null)));
    }
}


