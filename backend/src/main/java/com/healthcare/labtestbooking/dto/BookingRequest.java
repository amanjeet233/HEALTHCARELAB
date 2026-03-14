package com.healthcare.labtestbooking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {

    @Positive(message = "Patient ID must be positive")
    private Long patientId;

    @JsonProperty("labTestId")
    @NotNull(message = "Test ID is required")
    @Positive(message = "Test ID must be positive")
    private Long testId;

    @NotNull(message = "Booking date is required")
    @Future(message = "Booking date must be in the future")
    private LocalDate bookingDate;

    @NotBlank(message = "timeSlot is required")
    @Size(max = 250, message = "timeSlot must be at most 250 characters")
    private String timeSlot;

    @Pattern(regexp = "^(HOME|LAB)$", message = "Collection type must be HOME or LAB")
    @NotBlank(message = "collectionAddress is required")
    @Size(max = 250, message = "collectionAddress must be at most 250 characters")
    private String collectionAddress;
    
    @DecimalMin(value = "0.0", message = "Discount cannot be negative")
    private BigDecimal discount;
    
    @Size(max = 500, message = "Notes must be at most 500 characters")
    @NotBlank(message = "notes is required")
    @Size(max = 250, message = "notes must be at most 250 characters")
    private String notes;
}
