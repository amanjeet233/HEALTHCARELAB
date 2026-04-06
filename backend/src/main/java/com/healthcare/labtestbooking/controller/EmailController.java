package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.EmailRequest;
import com.healthcare.labtestbooking.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * ✅ EMAIL CONTROLLER
 * Handles email operations including sending PDFs with bookings and reports
 */
@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("isAuthenticated()")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EmailController {

    private final EmailService emailService;

    /**
     * ✅ SEND EMAIL WITH PDF ATTACHMENT
     * POST /api/email/send-with-attachment
     */
    @PostMapping("/send-with-attachment")
    public ResponseEntity<?> sendEmailWithAttachment(@RequestBody EmailRequest request) {
        try {
            log.info("📧 Sending email to: {} with attachment: {}", request.getToEmail(), request.getAttachmentFilename());

            // Validate request
            if (request.getToEmail() == null || request.getToEmail().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email address is required"));
            }

            if (request.getAttachmentBase64() == null || request.getAttachmentBase64().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("PDF attachment is required"));
            }

            // Send email with attachment
            emailService.sendEmailWithAttachment(
                    request.getToEmail(),
                    request.getSubject() != null ? request.getSubject() : "Document",
                    request.getBody() != null ? request.getBody() : "Please find the attached document.",
                    request.getAttachmentBase64(),
                    request.getAttachmentFilename() != null ? request.getAttachmentFilename() : "document.pdf"
            );

            log.info("✅ Email sent successfully to: {}", request.getToEmail());
            return ResponseEntity.ok(createSuccessResponse("Email sent successfully"));
        } catch (Exception e) {
            log.error("❌ Error sending email: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to send email: " + e.getMessage()));
        }
    }

    /**
     * ✅ SEND BOOKING RECEIPT EMAIL
     * POST /api/email/send-receipt
     */
    @PostMapping("/send-receipt")
    public ResponseEntity<?> sendBookingReceipt(
            @RequestParam String email,
            @RequestParam String bookingReference,
            @RequestParam String testName
    ) {
        try {
            log.info("📄 Sending booking receipt to: {}", email);

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email is required"));
            }

            emailService.sendBookingReceipt(email, bookingReference, testName);

            log.info("✅ Receipt email sent to: {}", email);
            return ResponseEntity.ok(createSuccessResponse("Receipt sent successfully"));
        } catch (Exception e) {
            log.error("❌ Error sending receipt: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to send receipt: " + e.getMessage()));
        }
    }

    /**
     * ✅ SEND LAB REPORT EMAIL
     * POST /api/email/send-report
     */
    @PostMapping("/send-report")
    public ResponseEntity<?> sendLabReport(
            @RequestParam String email,
            @RequestParam String bookingReference,
            @RequestParam String testName
    ) {
        try {
            log.info("📊 Sending lab report to: {}", email);

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email is required"));
            }

            emailService.sendLabReport(email, bookingReference, testName);

            log.info("✅ Report email sent to: {}", email);
            return ResponseEntity.ok(createSuccessResponse("Report sent successfully"));
        } catch (Exception e) {
            log.error("❌ Error sending report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to send report: " + e.getMessage()));
        }
    }

    /**
     * ✅ HELPER: CREATE SUCCESS RESPONSE
     */
    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }

    /**
     * ✅ HELPER: CREATE ERROR RESPONSE
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        return response;
    }
}
