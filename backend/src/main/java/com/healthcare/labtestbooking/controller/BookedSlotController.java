package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.BookedSlot;
import com.healthcare.labtestbooking.service.BookedSlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/booked-slots")
@RequiredArgsConstructor
@Tag(name = "Booked Slots", description = "Management of booked time slots")
public class BookedSlotController {

    private final BookedSlotService bookedSlotService;

    @GetMapping("/date/{date}")
    @Operation(summary = "Get booked slots for a specific date")
    public ResponseEntity<ApiResponse<List<BookedSlot>>> getBookedSlotsForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success("Booked slots fetched successfully",
                bookedSlotService.getBookedSlotsForDate(date)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Release a booked slot")
    public ResponseEntity<ApiResponse<Void>> releaseSlot(@PathVariable Long id) {
        bookedSlotService.releaseSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Slot released successfully", null));
    }
}
