package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.BookingRequest;
import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Bookings", description = "Lab test booking management")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

        private final BookingService bookingService;

        @PostMapping
        @Operation(summary = "Create a new booking", description = "Create a new lab test booking with tests and slot information")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Booking created successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid booking data"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
                log.info("Create booking request: {}", request);
                BookingResponse response = bookingService.createBooking(request);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Booking created successfully", response));
        }

        @GetMapping("/my")
        @Operation(summary = "Get my bookings", description = "Retrieve all bookings for the authenticated user")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bookings retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<BookingResponse>>> getMyBookings(
                        @PageableDefault(size = 20, sort = "bookingDate") Pageable pageable) {
                log.info("Get my bookings request | Page: {}, Size: {}",
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<BookingResponse> bookings = bookingService.getMyBookings(pageable);
                return ResponseEntity.ok(ApiResponse.success("Bookings fetched successfully", bookings));
        }

        @GetMapping("/technician")
        @Operation(summary = "Get technician bookings", description = "Retrieve all bookings assigned to the authenticated technician")
        public List<com.healthcare.labtestbooking.entity.Booking> getTechnicianBookings() {
                var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                org.springframework.security.core.userdetails.UserDetails userDetails = (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();
                com.healthcare.labtestbooking.entity.User technician = bookingService.getUserByEmail(userDetails.getUsername());
                return bookingService.getTechnicianBookings(technician.getId());
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get booking by ID", description = "Retrieve a specific booking by its ID")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Booking retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
                log.info("Get booking by id: {}", id);
                BookingResponse booking = bookingService.getBookingById(id);
                return ResponseEntity.ok(ApiResponse.success(booking));
        }

        @GetMapping("/slots")
        @Operation(summary = "Get available slots", description = "Retrieve available time slots for a specific test and date")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Available slots retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid date or test ID"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<List<String>>> getAvailableSlots(@RequestParam String date,
                        @RequestParam Long testId) {
                log.info("Get available slots for date: {} and testId: {}", date, testId);
                List<String> slots = bookingService.getAvailableSlots(date, testId);
                return ResponseEntity.ok(ApiResponse.success(slots));
        }

        @PutMapping("/{id}/status")
        @PreAuthorize("hasAnyRole('TECHNICIAN', 'MEDICAL_OFFICER')")
        @Operation(summary = "Update booking status", description = "Update the status of a booking (TECHNICIAN role required)")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Booking status updated"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - TECHNICIAN role required"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(@PathVariable Long id,
                        @RequestParam String status) {
                log.info("Update booking {} status to: {}", id, status);
                BookingResponse booking = bookingService.updateBookingStatus(id, status);
                return ResponseEntity.ok(ApiResponse.success("Booking status updated", booking));
        }

        @PutMapping("/{id}/technician")
        @PreAuthorize("hasRole('ADMIN')")
        @Operation(summary = "Assign technician", description = "Assign a technician to a booking (ADMIN role required)")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Technician assigned successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking or technician not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<BookingResponse>> assignTechnician(@PathVariable Long id,
                        @RequestParam Long technicianId) {
                log.info("Assign technician {} to booking {}", technicianId, id);
                BookingResponse booking = bookingService.assignTechnician(id, technicianId);
                return ResponseEntity.ok(ApiResponse.success("Technician assigned", booking));
        }

        @PutMapping("/{id}/cancel")
        @Operation(summary = "Cancel booking", description = "Cancel an existing booking")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Booking cancelled successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(@PathVariable Long id) {
                log.info("Cancel booking: {}", id);
                BookingResponse booking = bookingService.cancelBooking(id);
                return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));
        }

        // ===== Admin Endpoints =====

        @GetMapping("/admin/all")
        @PreAuthorize("hasRole('ADMIN')")
        @Operation(summary = "Get all bookings", description = "Retrieve all bookings in the system (ADMIN role required)")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "All bookings retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookings(
                        @PageableDefault(size = 20, sort = "bookingDate") Pageable pageable) {
                log.info("Get all bookings (admin) | Page: {}, Size: {}",
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<BookingResponse> bookings = bookingService.getAllBookings(pageable);
                return ResponseEntity.ok(ApiResponse.success("Bookings fetched successfully", bookings));
        }

        @PutMapping("/admin/{id}/status")
        @PreAuthorize("hasRole('ADMIN')")
        @Operation(summary = "Admin update booking status", description = "Update booking status as admin (ADMIN role required)")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Booking status updated"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<BookingResponse>> adminUpdateBookingStatus(@PathVariable Long id,
                        @RequestParam String status) {
                log.info("Admin update booking {} status to: {}", id, status);
                BookingResponse booking = bookingService.updateBookingStatus(id, status);
                return ResponseEntity.ok(ApiResponse.success("Booking status updated", booking));
        }

        // ===== Upcoming / History / Reschedule =====

        @GetMapping("/upcoming")
        @Operation(summary = "Get upcoming bookings", description = "Retrieve future bookings in BOOKED status for the authenticated user")
        public ResponseEntity<ApiResponse<List<BookingResponse>>> getUpcomingBookings() {
                List<BookingResponse> bookings = bookingService.getUpcomingBookings();
                return ResponseEntity.ok(ApiResponse.success(bookings));
        }

        @GetMapping("/history")
        @Operation(summary = "Get booking history", description = "Retrieve past/completed/cancelled bookings for the authenticated user")
        public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingHistory() {
                List<BookingResponse> bookings = bookingService.getBookingHistory();
                return ResponseEntity.ok(ApiResponse.success(bookings));
        }

        @PostMapping("/{id}/reschedule")
        @Operation(summary = "Reschedule booking", description = "Change the date and time slot of an existing booking")
        public ResponseEntity<ApiResponse<BookingResponse>> rescheduleBooking(
                        @PathVariable Long id,
                        @RequestParam String date,
                        @RequestParam String timeSlot) {
                log.info("Reschedule booking {} to {} at {}", id, date, timeSlot);
                BookingResponse booking = bookingService.rescheduleBooking(
                                id, java.time.LocalDate.parse(date), timeSlot);
                return ResponseEntity.ok(ApiResponse.success("Booking rescheduled successfully", booking));
        }
}
