package com.healthcare.labtestbooking.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.Base64;
import java.util.Objects;

/**
 * ✅ EMAIL SERVICE WITH PDF ATTACHMENT SUPPORT
 * Handles sending emails with PDF attachments for booking receipts and lab reports
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@healthlab.com}")
    private String fromEmail;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${app.email.mock:true}")
    private boolean emailMock;

    /**
     * ✅ SEND SIMPLE EMAIL
     */
    public void sendSimpleEmail(String toEmail, String subject, String body) {
        if (!emailEnabled && !emailMock) {
            log.warn("❌ Email service not enabled");
            return;
        }

        if (emailMock) {
            log.info("[EMAIL MOCK] To: {}", toEmail);
            log.info("[EMAIL MOCK] Subject: {}", subject);
            log.info("[EMAIL MOCK] Body: {}", body);
            return;
        }

        try {
            if (mailSender == null) {
                log.error("❌ JavaMailSender not configured");
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("✅ Email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("❌ Failed to send email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * ✅ SEND EMAIL WITH PDF ATTACHMENT
     * @param toEmail recipient email
     * @param subject email subject
     * @param body email body (HTML supported)
     * @param attachmentBase64 PDF file in base64 format
     * @param attachmentFilename filename for the attachment
     */
    public void sendEmailWithAttachment(
            String toEmail,
            String subject,
            String body,
            String attachmentBase64,
            String attachmentFilename
    ) {
        if (!emailEnabled && !emailMock) {
            log.warn("❌ Email service not enabled");
            return;
        }

        if (emailMock) {
            log.info("[EMAIL MOCK] To: {}", toEmail);
            log.info("[EMAIL MOCK] Subject: {}", subject);
            log.info("[EMAIL MOCK] Attachment: {}", attachmentFilename);
            log.info("[EMAIL MOCK] Body: {}", body);
            return;
        }

        try {
            if (mailSender == null) {
                log.error("❌ JavaMailSender not configured");
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(Objects.requireNonNull(fromEmail, "From email must not be null"));
            helper.setTo(Objects.requireNonNull(toEmail, "Recipient email must not be null"));
            helper.setSubject(Objects.requireNonNull(subject, "Subject must not be null"));
            helper.setText(Objects.requireNonNull(body, "Body must not be null"), true); // true for HTML

            // Decode base64 and add as attachment
            String[] parts = Objects.requireNonNull(attachmentBase64, "Attachment base64 must not be null").split(",");
            byte[] decodedBytes = Base64.getDecoder().decode(parts.length > 1 ? parts[1] : parts[0]);
            helper.addAttachment(Objects.requireNonNull(attachmentFilename, "Attachment filename must not be null"), new ByteArrayResource(decodedBytes));

            mailSender.send(message);
            log.info("✅ Email with attachment sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("❌ Failed to send email with attachment to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * ✅ SEND BOOKING RECEIPT EMAIL
     */
    public void sendBookingReceipt(String toEmail, String bookingReference, String testName) {
        String subject = "Booking Receipt - " + bookingReference;
        String body = String.format(
                "Dear Patient,\n\n" +
                "Your booking has been confirmed.\n\n" +
                "📋 Booking Reference: %s\n" +
                "🔬 Test: %s\n\n" +
                "Please keep this reference number for your records.\n\n" +
                "Thank you,\nHealthcare Lab Team",
                bookingReference, testName
        );
        sendSimpleEmail(toEmail, subject, body);
    }

    /**
     * ✅ SEND LAB REPORT EMAIL
     */
    public void sendLabReport(String toEmail, String bookingReference, String testName) {
        String subject = "Lab Report - " + bookingReference;
        String body = String.format(
                "Dear Patient,\n\n" +
                "Your lab report is ready.\n\n" +
                "📋 Booking Reference: %s\n" +
                "🔬 Test: %s\n\n" +
                "Please find your detailed report attached.\n" +
                "For medical advice, please consult your doctor.\n\n" +
                "Thank you,\nHealthcare Lab Team",
                bookingReference, testName
        );
        sendSimpleEmail(toEmail, subject, body);
    }

    /**
     * ✅ SEND EMAIL WITH PDF (Receipt or Report)
     */
    public void sendPDFDocument(
            String toEmail,
            String subject,
            String body,
            String pdfBase64,
            String filename
    ) {
        sendEmailWithAttachment(toEmail, subject, body, pdfBase64, filename);
    }
}
