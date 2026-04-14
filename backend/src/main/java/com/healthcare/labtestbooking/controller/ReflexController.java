package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.ReflexDismissRequest;
import com.healthcare.labtestbooking.dto.ReflexSuggestionDto;
import com.healthcare.labtestbooking.service.ReflexTestingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reflex")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MEDICAL_OFFICER','ADMIN')")
public class ReflexController {

    private final ReflexTestingService reflexTestingService;

    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<List<ReflexSuggestionDto>>> getReflexSuggestions(@PathVariable Long bookingId) {
        List<ReflexSuggestionDto> data = reflexTestingService.getSuggestionsForBooking(bookingId, true);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PutMapping("/{suggestionId}/accept")
    public ResponseEntity<ApiResponse<ReflexSuggestionDto>> acceptSuggestion(@PathVariable Long suggestionId) {
        ReflexSuggestionDto data = reflexTestingService.acceptSuggestion(suggestionId);
        return ResponseEntity.ok(ApiResponse.success("Reflex suggestion accepted", data));
    }

    @PutMapping("/{suggestionId}/dismiss")
    public ResponseEntity<ApiResponse<ReflexSuggestionDto>> dismissSuggestion(
            @PathVariable Long suggestionId,
            @RequestBody(required = false) ReflexDismissRequest request) {
        String reason = request != null ? request.getReason() : null;
        ReflexSuggestionDto data = reflexTestingService.dismissSuggestion(suggestionId, reason);
        return ResponseEntity.ok(ApiResponse.success("Reflex suggestion dismissed", data));
    }
}
