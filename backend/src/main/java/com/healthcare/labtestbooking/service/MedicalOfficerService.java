package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.ReportVerificationRequest;
import com.healthcare.labtestbooking.dto.ReportVerificationResponse;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.entity.enums.VerificationStatus;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.ReportVerificationRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalOfficerService {

    private final ReportVerificationRepository reportVerificationRepository;
    private final BookingRepository bookingRepository;
    private final ReportResultRepository reportResultRepository;
    private final UserRepository userRepository;

    public List<ReportVerificationResponse> getPendingVerifications() {
        validateMedicalOfficerAccess();

        List<ReportVerification> pendingVerifications = reportVerificationRepository
                .findByStatusOrderByCreatedAtDesc(VerificationStatus.PENDING);

        return pendingVerifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReportVerificationResponse verifyReport(Long bookingId, ReportVerificationRequest request) {
        validateMedicalOfficerAccess();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        List<ReportResult> reportResults = reportResultRepository.findByBookingId(bookingId);
        if (reportResults.isEmpty()) {
            throw new RuntimeException("No report results found for booking with id: " + bookingId);
        }

        User medicalOfficer = getCurrentUser();

        ReportVerification verification = reportVerificationRepository.findByBookingId(bookingId)
                .orElse(null);

        if (verification == null) {
            verification = ReportVerification.builder()
                    .booking(booking)
                    .medicalOfficer(medicalOfficer)
                    .build();
        }

        verification.setClinicalNotes(request.getClinicalNotes());
        verification.setDigitalSignature(generateDigitalSignature(medicalOfficer));
        verification.setVerificationDate(LocalDateTime.now());
        verification.setStatus(VerificationStatus.APPROVED);
        verification.setIcdCodes(request.getIcdCodes() != null ? String.join(",", request.getIcdCodes()) : null);

        verification = reportVerificationRepository.save(verification);

        booking.setMedicalOfficer(medicalOfficer);
        bookingRepository.save(booking);

        return mapToResponse(verification);
    }

    @Transactional
    public ReportVerificationResponse rejectReport(Long bookingId, String rejectionReason) {
        validateMedicalOfficerAccess();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        User medicalOfficer = getCurrentUser();

        ReportVerification verification = reportVerificationRepository.findByBookingId(bookingId)
                .orElse(null);

        if (verification == null) {
            verification = ReportVerification.builder()
                    .booking(booking)
                    .medicalOfficer(medicalOfficer)
                    .build();
        }

        verification.setClinicalNotes("Report rejected: " + rejectionReason);
        verification.setDigitalSignature(generateDigitalSignature(medicalOfficer));
        verification.setVerificationDate(LocalDateTime.now());
        verification.setStatus(VerificationStatus.REJECTED);

        verification = reportVerificationRepository.save(verification);

        return mapToResponse(verification);
    }

    @Transactional
    public ReportVerificationResponse addICDCodes(Long bookingId, List<String> icdCodes) {
        validateMedicalOfficerAccess();

        ReportVerification verification = reportVerificationRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("No verification found for booking with id: " + bookingId));

        if (verification.getStatus() != VerificationStatus.APPROVED) {
            throw new RuntimeException("ICD codes can only be added to verified reports");
        }

        verification.setIcdCodes(String.join(",", icdCodes));
        verification.setUpdatedAt(LocalDateTime.now());

        verification = reportVerificationRepository.save(verification);

        return mapToResponse(verification);
    }

    @Transactional
    public void referToSpecialist(Long bookingId, String specialistType, String referralNotes) {
        validateMedicalOfficerAccess();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        ReportVerification verification = reportVerificationRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("No verification found for booking with id: " + bookingId));

        String existingNotes = verification.getClinicalNotes() != null ? verification.getClinicalNotes() : "";
        String referralText = String.format("\n\nREFERRAL TO %s:\n%s", specialistType.toUpperCase(), referralNotes);

        verification.setClinicalNotes(existingNotes + referralText);
        verification.setUpdatedAt(LocalDateTime.now());
        verification.setRequiresSpecialistReferral(true);
        verification.setSpecialistType(specialistType);

        reportVerificationRepository.save(verification);
    }

    private void validateMedicalOfficerAccess() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != UserRole.MEDICAL_OFFICER && currentUser.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Medical officer access required");
        }
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String generateDigitalSignature(User medicalOfficer) {
        return String.format("Digitally signed by Dr. %s on %s",
                medicalOfficer.getName(),
                LocalDateTime.now().toString());
    }

    private ReportVerificationResponse mapToResponse(ReportVerification verification) {
        return ReportVerificationResponse.builder()
                .id(verification.getId())
                .bookingId(verification.getBooking().getId())
                .medicalOfficerId(verification.getMedicalOfficer().getId())
                .medicalOfficerName(verification.getMedicalOfficer().getName())
                .status(verification.getStatus().name())
                .clinicalNotes(verification.getClinicalNotes())
                .digitalSignature(verification.getDigitalSignature())
                .verificationDate(verification.getVerificationDate())
                .icdCodes(verification.getIcdCodes())
                .requiresSpecialistReferral(verification.getRequiresSpecialistReferral())
                .specialistType(verification.getSpecialistType())
                .createdAt(verification.getCreatedAt())
                .updatedAt(verification.getUpdatedAt())
                .build();
    }
}
