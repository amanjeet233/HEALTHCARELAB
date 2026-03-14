package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportVerificationRequest {
    @Size(max = 1000, message = "Clinical notes must be at most 1000 characters")
    @NotBlank(message = "digitalSignature is required")
    @Size(max = 250, message = "digitalSignature must be at most 250 characters")
    private String digitalSignature;

    @NotNull(message = "Approval status is required")
    private Boolean approved;

    @Size(max = 500, message = "ICD codes must be at most 500 characters")
    @NotBlank(message = "specialistType is required")
    @Size(max = 250, message = "specialistType must be at most 250 characters")
    private String specialistType;
}
