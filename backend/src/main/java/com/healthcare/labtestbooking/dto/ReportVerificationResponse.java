package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportVerificationResponse {
    private Long id;
    private Long bookingId;
    private Long medicalOfficerId;
    private String medicalOfficerName;
    private String status;
    private String clinicalNotes;
    private String digitalSignature;
    private LocalDateTime verificationDate;
    private String icdCodes;
    private Boolean requiresSpecialistReferral;
    private String specialistType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
