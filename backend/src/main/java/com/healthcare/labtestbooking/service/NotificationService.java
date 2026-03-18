package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Order;
import com.healthcare.labtestbooking.entity.Report;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {

    @Value("${app.notification.sms.mock:true}")
    private boolean smsMock;

    public void sendSMS(String phoneNumber, String message) {
        if (smsMock) {
            log.info("[SMS MOCK] To {}: {}", phoneNumber, message);
            return;
        }
        log.warn("SMS provider not configured; message to {} not sent", phoneNumber);
    }

    /**
     * Sends a password-reset email.
     * Real delivery is disabled because JavaMailSender is not configured;
     * the link is logged so developers can test the flow without an SMTP server.
     */
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        log.info("[EMAIL MOCK] Password-reset email to: {}", toEmail);
        log.info("[EMAIL MOCK] Reset link: {}", resetLink);
    }

    /**
     * Sends an email verification link.
     * Real delivery is disabled because JavaMailSender is not configured;
     * the link is logged so developers can test the flow without an SMTP server.
     */
    public void sendVerificationEmail(String toEmail, String verificationLink) {
        log.info("[EMAIL MOCK] Verification email to: {}", toEmail);
        log.info("[EMAIL MOCK] Verification link: {}", verificationLink);
    }

    public void sendOrderConfirmed(Order order) {
        log.debug("Notification disabled for confirmed order: {}", order.getId());
    }

    public void sendTechnicianAssigned(Order order) {
        log.debug("Notification disabled for technician assignment: {}", order.getId());
    }

    public void sendSampleCollected(Order order) {
        log.debug("Notification disabled for sample collection: {}", order.getId());
    }

    public void sendReportReady(Order order, Report report) {
        log.debug("Notification disabled for report ready: {}", order.getId());
    }
}