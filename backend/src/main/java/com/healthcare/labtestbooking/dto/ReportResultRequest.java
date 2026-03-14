package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResultRequest {
    @NotNull(message = "Booking ID is required")
    @Positive(message = "Booking ID must be positive")
    private Long bookingId;
    
    @Positive(message = "Technician ID must be positive")
    private Long technicianId;
    
    @NotNull(message = "Results are required")
    @Size(min = 1, message = "At least one result item is required")
    @Valid
    private List<ResultItem> results;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultItem {
        @NotNull(message = "Parameter ID is required")
        @Positive(message = "Parameter ID must be positive")
        private Long parameterId;

        @NotBlank(message = "resultValue is required")
        @Size(max = 250, message = "resultValue must be at most 250 characters")
        private String resultValue;

        @Size(max = 50, message = "Unit must be at most 50 characters")
        @NotBlank(message = "normalRange is required")
        @Size(max = 250, message = "normalRange must be at most 250 characters")
        private String normalRange;

        @Size(max = 250, message = "Notes must be at most 250 characters")
        @NotBlank(message = "status is required")
        @Size(max = 250, message = "status must be at most 250 characters")
        private String status;
    }
}