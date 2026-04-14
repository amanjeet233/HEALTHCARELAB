package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.service.TechnicianAssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Technician Management", description = "Technician assignment and location tracking")
@SecurityRequirement(name = "bearerAuth")
public class TechnicianController {

    private final TechnicianAssignmentService technicianAssignmentService;

    @GetMapping("/available")
    @Operation(summary = "Get available technicians", description = "Get available technicians for a specific date and pincode")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Technicians retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid date or pincode"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getAvailableTechnicians(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String pincode,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("GET /api/technicians/available - date: {}, pincode: {}", date, pincode);
        List<Map<String, Object>> technicians = technicianAssignmentService.getAvailableTechnicians(date, pincode);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), technicians.size());
        List<Map<String, Object>> content = start >= technicians.size()
                ? List.of()
                : technicians.subList(start, end);
        Page<Map<String, Object>> page = new PageImpl<>(content, pageable, technicians.size());
        return ResponseEntity.ok(ApiResponse.success("Found " + technicians.size() + " available technicians", page));
    }

    @PostMapping("/assign/{bookingId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    @Operation(summary = "Auto-assign technician", description = "Automatically assign the nearest available technician to a booking")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Technician assigned successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid booking ID"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Booking already has a technician"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> autoAssignTechnician(@PathVariable Long bookingId) {
        log.info("POST /api/technicians/assign/{}", bookingId);
        Map<String, Object> result = technicianAssignmentService.autoAssignTechnician(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Technician assigned successfully", result));
    }

    @PostMapping("/reassign/{bookingId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    @Operation(summary = "Reassign technician", description = "Reassign a different technician to a booking")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Technician reassigned successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking or technician not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> reassignTechnician(
            @PathVariable Long bookingId,
            @Valid @RequestBody ReassignRequest request) {
        log.info("POST /api/technicians/reassign/{} - newTechnicianId: {}", bookingId, request.getNewTechnicianId());
        Map<String, Object> result = technicianAssignmentService.reassignTechnician(bookingId, request.getNewTechnicianId());
        return ResponseEntity.ok(ApiResponse.success("Technician reassigned successfully", result));
    }

    @GetMapping("/location/{techId}")
    @Operation(summary = "Get technician location", description = "Get the current GPS location of a technician")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Location retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Technician not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTechnicianLocation(@PathVariable Long techId) {
        log.info("GET /api/technicians/location/{}", techId);
        Map<String, Object> location = technicianAssignmentService.getTechnicianLocation(techId);
        return ResponseEntity.ok(ApiResponse.success("Location retrieved", location));
    }

    /**
     * GET /api/technicians/available-for-date?date=YYYY-MM-DD
     * Returns all active technicians with their booking count for the given date,
     * for MO load-balanced assignment.
     */
    @GetMapping("/available-for-date")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    @Operation(summary = "Technicians with load info for a date",
               description = "Returns active technicians and their booking count for a specific date")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTechniciansForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("GET /api/technicians/available-for-date?date={}", date);
        List<Map<String, Object>> result = technicianAssignmentService.getTechniciansWithLoadForDate(date);
        return ResponseEntity.ok(ApiResponse.success("Technicians fetched for date " + date, result));
    }

    @Data
    public static class ReassignRequest {
        @NotNull(message = "New technician ID is required")
        private Long newTechnicianId;
    }
}
