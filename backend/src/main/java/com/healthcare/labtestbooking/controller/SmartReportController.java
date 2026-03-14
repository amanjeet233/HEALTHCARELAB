package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.SmartReportDTO;
import com.healthcare.labtestbooking.dto.TrendDataDTO;
import com.healthcare.labtestbooking.service.SmartReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class SmartReportController {

    private final SmartReportService smartReportService;

    @GetMapping("/{id}/smart")
    public ResponseEntity<ApiResponse<SmartReportDTO>> getSmartReport(@PathVariable Long id) {
        SmartReportDTO report = smartReportService.getSmartReport(id);
        return ResponseEntity.ok(ApiResponse.success("Smart report", report));
    }

    @GetMapping("/{id}/trends/{testId}")
    public ResponseEntity<ApiResponse<TrendDataDTO>> getTrendData(
        @PathVariable Long id,
        @PathVariable Long testId,
        @RequestParam(defaultValue = "10") int limit
    ) {
        SmartReportDTO report = smartReportService.getSmartReport(id);
        TrendDataDTO trends = smartReportService.generateTrends(report.getPatientId(), testId, limit);
        return ResponseEntity.ok(ApiResponse.success("Trend data", trends));
    }

    @GetMapping("/{id}/critical")
    public ResponseEntity<ApiResponse<List<SmartReportDTO.CriticalValueDTO>>> getCriticalValues(@PathVariable Long id) {
        List<SmartReportDTO.CriticalValueDTO> criticalValues = smartReportService.flagCriticalValues(id);
        return ResponseEntity.ok(ApiResponse.success("Critical values", criticalValues));
    }
}
