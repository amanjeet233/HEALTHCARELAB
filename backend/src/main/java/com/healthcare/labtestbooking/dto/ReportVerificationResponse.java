package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

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

    // New info fields
    private String patientName;
    private Long patientId;
    private String testName;
    private String bookingDate;
    private Boolean criticalFlag;
    private Boolean anyResultAbnormal;
    private Boolean previouslyRejected;
    private List<DeltaCheckEntry> previousResults;
    private String digitalFingerprint;
    private Integer version;
    private Boolean isAmended;
    private String amendmentReason;
}
