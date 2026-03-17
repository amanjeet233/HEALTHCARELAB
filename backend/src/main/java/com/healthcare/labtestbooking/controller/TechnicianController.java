package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.Technician;
import com.healthcare.labtestbooking.service.TechnicianAssignmentService;
import io.swagger.v3.oas.annotations.Operation;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping({ "/api/technicians", "/api/technician" })
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Technicians", description = "Technician assignment and availability management")
@SecurityRequirement(name = "bearerAuth")
public class TechnicianController {
    private final TechnicianAssignmentService technicianAssignmentService;
    private final com.healthcare.labtestbooking.service.BookingService bookingService;

    @GetMapping("/bookings/technician")
    @PreAuthorize("hasRole('TECHNICIAN')")
    @Operation(summary = "Get technician bookings", description = "Retrieve all bookings assigned to the authenticated technician")
    public ResponseEntity<ApiResponse<List<com.healthcare.labtestbooking.dto.BookingResponse>>> getTechnicianBookings() {
        log.info("GET /api/technician/bookings/technician");
        List<com.healthcare.labtestbooking.dto.BookingResponse> bookings = bookingService.getTechnicianBookings();
        return ResponseEntity.ok(ApiResponse.success("Technician bookings fetched successfully", bookings));
    }

    @GetMapping("/assignments")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<com.healthcare.labtestbooking.dto.BookingResponse>>> getAssignments() {
        log.info("GET /api/technician/assignments");
        List<com.healthcare.labtestbooking.dto.BookingResponse> bookings = bookingService.getTechnicianBookings();
        return ResponseEntity.ok(ApiResponse.success("Success", bookings));
    }

    @PostMapping("/collect-sample/{bookingId}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<com.healthcare.labtestbooking.dto.BookingResponse>> collectSample(
            @PathVariable Long bookingId) {
        log.info("POST /api/technician/collect-sample/{}", bookingId);
        com.healthcare.labtestbooking.dto.BookingResponse response = bookingService.markCollected(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Sample collected successfully", response));
    }

    @GetMapping("/available")
    @Operation(summary = "Get available technicians", description = "Find technicians available for a specific location, date, and time slot")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Available technicians retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid pincode, date, or slot"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<List<Technician>>> getAvailableTechnicians(
            @RequestParam String pincode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String slot) {
        log.info("GET /api/technicians/available?pincode={}&date={}&slot={}", pincode, date, slot);
        List<Technician> technicians = technicianAssignmentService.findAvailableTechnicians(pincode, date, slot);
        return ResponseEntity.ok(ApiResponse.success("Available technicians", technicians));
    }

    @PostMapping("/assign/{bookingId}")
    @Operation(summary = "Assign technician", description = "Assign an available technician to a booking")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Technician assigned successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found or no available technicians"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Technician>> assignTechnician(@PathVariable Long bookingId) {
        Technician technician = technicianAssignmentService.assignTechnician(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Technician assigned", technician));
    }

    @PostMapping("/reassign/{bookingId}")
    @Operation(summary = "Reassign technician", description = "Reassign a different technician to an existing booking")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Technician reassigned successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found or no available technicians"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Technician>> reassignTechnician(@PathVariable Long bookingId) {
        Technician technician = technicianAssignmentService.reassignTechnician(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Technician reassigned", technician));
    }

    @GetMapping("/location/{technicianId}")
    @Operation(summary = "Get technician location", description = "Retrieve the current location of a technician")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Technician location retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Technician not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTechnicianLocation(@PathVariable Long technicianId) {
        return technicianAssignmentService.getTechnicianLocation(technicianId)
                .map(tech -> {
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("technicianId", tech.getId());
                    payload.put("lat", tech.getCurrentLat());
                    payload.put("lng", tech.getCurrentLng());
                    payload.put("lastUpdated", tech.getLastLocationUpdate());
                    return ResponseEntity.ok(ApiResponse.success("Technician location", payload));
                })
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.success("Technician not found", null)));
    }
}


