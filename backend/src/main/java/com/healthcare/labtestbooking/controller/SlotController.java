package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.BookedSlot;
import com.healthcare.labtestbooking.entity.SlotConfig;
import com.healthcare.labtestbooking.service.SlotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/slots")
@RequiredArgsConstructor
@Slf4j
public class SlotController {

    private final SlotService slotService;

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<SlotConfig>>> getAvailableSlots(
        @RequestParam String pincode,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        log.info("GET /api/slots/available?pincode={}&date={}", pincode, date);
        List<SlotConfig> slots = slotService.getAvailableSlots(pincode, date);
        return ResponseEntity.ok(ApiResponse.success("Available slots", slots));
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkSlot(
        @RequestParam String pincode,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam String slotTime
    ) {
        boolean available = slotService.isSlotAvailable(pincode, date, slotTime);
        return ResponseEntity.ok(ApiResponse.success("Slot availability", available));
    }

    @PostMapping("/book")
    public ResponseEntity<ApiResponse<BookedSlot>> bookSlot(
        @RequestParam Long bookingId,
        @RequestParam Long slotId
    ) {
        BookedSlot bookedSlot = slotService.bookSlot(bookingId, slotId);
        return ResponseEntity.ok(ApiResponse.success("Slot booked", bookedSlot));
    }

    @PostMapping("/release")
    public ResponseEntity<ApiResponse<Void>> releaseSlot(@RequestParam Long bookingId) {
        slotService.releaseSlot(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Slot released", null));
    }
}
