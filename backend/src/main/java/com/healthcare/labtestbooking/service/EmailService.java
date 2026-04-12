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

    public void sendBookingConfirmationHtml(
            String toEmail,
            String userName,
            String confirmationNumber,
            String itemName,
            String appointmentDate,
            String appointmentTime,
            String collectionAddress,
            String paymentMethod,
            String amount
    ) {
        String subject = "Booking Confirmed - " + confirmationNumber;
        String body = """
                <!DOCTYPE html>
                <html>
                <body style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:#f5f5f5;padding:24px;">
                  <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;">
                    <div style="background:#2E75B6;color:white;padding:24px;text-align:center;">
                      <h1 style="margin:0;">Booking Confirmed</h1>
                    </div>
                    <div style="padding:24px;color:#1f2937;">
                      <p>Hi <strong>%s</strong>,</p>
                      <p>Your HealthcareLab booking has been confirmed.</p>
                      <table style="width:100%%;border-collapse:collapse;">
                        <tr><td style="padding:8px 0;color:#6b7280;">Confirmation</td><td style="padding:8px 0;text-align:right;"><strong>%s</strong></td></tr>
                        <tr><td style="padding:8px 0;color:#6b7280;">Package / Test</td><td style="padding:8px 0;text-align:right;"><strong>%s</strong></td></tr>
                        <tr><td style="padding:8px 0;color:#6b7280;">Date</td><td style="padding:8px 0;text-align:right;">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#6b7280;">Time</td><td style="padding:8px 0;text-align:right;">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#6b7280;">Address</td><td style="padding:8px 0;text-align:right;">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#6b7280;">Payment Method</td><td style="padding:8px 0;text-align:right;">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#6b7280;">Amount Paid</td><td style="padding:8px 0;text-align:right;"><strong>%s</strong></td></tr>
                      </table>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(
                userName,
                confirmationNumber,
                itemName,
                appointmentDate,
                appointmentTime,
                collectionAddress,
                paymentMethod,
                amount
        );
        sendEmailWithAttachment(toEmail, subject, body, "", "ignore.txt");
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
