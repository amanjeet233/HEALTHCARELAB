package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Order;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.User;
// import jakarta.mail.MessagingException;
// import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
// import org.springframework.core.io.ByteArrayResource;
// import org.springframework.mail.javamail.JavaMailSender;
// import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
// import org.thymeleaf.TemplateEngine;
// import org.thymeleaf.context.Context;

// import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class NotificationService {

    // Email functionality disabled - JavaMailSender bean not configured
    // private final JavaMailSender mailSender;
    // private final TemplateEngine templateEngine;

    // @Value("${app.notification.email.from:no-reply@labtestbooking.local}")
    // private String fromAddress;

    @Value("${app.notification.sms.mock:true}")
    private boolean smsMock;

    // @Value("${app.report.base-url:http://localhost:8080}")
    // private String reportBaseUrl;

    // Email functionality disabled - JavaMailSender bean not configured
    // public void sendEmail(String to, String subject, String body, byte[] attachment) {
    //     try {
    //         MimeMessage message = mailSender.createMimeMessage();
    //         boolean hasAttachment = attachment != null && attachment.length > 0;
    //         MimeMessageHelper helper = new MimeMessageHelper(message, hasAttachment, StandardCharsets.UTF_8.name());
    //         helper.setTo(to);
    //         helper.setFrom(fromAddress);
    //         helper.setSubject(subject);
    //         helper.setText(body, true);
    //         if (hasAttachment) {
    //             helper.addAttachment("attachment.pdf", new ByteArrayResource(attachment));
    //         }
    //         mailSender.send(message);
    //         log.info("Email sent to {} with subject '{}'", to, subject);
    //     } catch (MessagingException ex) {
    //         log.warn("Failed to send email to {}", to, ex);
    //     }
    // }

    public void sendSMS(String phoneNumber, String message) {
        if (smsMock) {
            log.info("[SMS MOCK] To {}: {}", phoneNumber, message);
            return;
        }
        log.warn("SMS provider not configured; message to {} not sent", phoneNumber);
    }

    public void sendOrderConfirmed(Order order) {
        // Email notifications disabled
        log.debug("Notification disabled for confirmed order: {}", order.getId());
        // User user = order.getUser();
        // if (user == null) {
        //     return;
        // }
        // Map<String, Object> model = baseModel(order);
        // String html = renderTemplate("email/order-confirmed", model);
        // sendEmail(user.getEmail(), "Order Confirmed", html, null);
        //
        // String sms = "Your order " + order.getId() + " is confirmed. "
        //         + "Status: " + order.getStatus() + ".";
        // sendSMS(user.getPhone(), sms);
    }

    public void sendTechnicianAssigned(Order order) {
        // Email notifications disabled
        log.debug("Notification disabled for technician assignment: {}", order.getId());
        // User user = order.getUser();
        // if (user == null) {
        //     return;
        // }
        // String sms = "Technician assigned for order " + order.getId() + ". "
        //         + "Details: " + safeValue(order.getTechnicianInfo()) + ".";
        // sendSMS(user.getPhone(), sms);
    }

    public void sendSampleCollected(Order order) {
        // Email notifications disabled
        log.debug("Notification disabled for sample collection: {}", order.getId());
        // User user = order.getUser();
        // if (user == null) {
        //     return;
        // }
        // String sms = "Sample collected for order " + order.getId() + ".";
        // sendSMS(user.getPhone(), sms);
    }

    public void sendReportReady(Order order, Report report) {
        // Email notifications disabled
        log.debug("Notification disabled for report ready: {}", order.getId());
        // User user = order.getUser();
        // if (user == null) {
        //     return;
        // }
        // Map<String, Object> model = baseModel(order);
        // if (report != null) {
        //     model.put("reportId", report.getId());
        //     model.put("reportLink", reportBaseUrl + "/api/reports/" + report.getId() + "/pdf");
        // } else {
        //     model.put("reportId", "-");
        //     model.put("reportLink", reportBaseUrl);
        // }
        // String html = renderTemplate("email/report-ready", model);
        // sendEmail(user.getEmail(), "Report Ready", html, null);
        //
        // String sms = "Your report is ready for order " + order.getId() + ".";
        // if (report != null) {
        //     sms += " Download: " + reportBaseUrl + "/api/reports/" + report.getId() + "/pdf";
        // }
        // sendSMS(user.getPhone(), sms);
    }

    // private Map<String, Object> baseModel(Order order) {
    //     Map<String, Object> model = new HashMap<>();
    //     model.put("orderId", order.getId());
    //     model.put("status", order.getStatus());
    //     model.put("itemName", resolveItemName(order));
    //     model.put("slotInfo", safeValue(order.getSlotInfo()));
    //     model.put("technicianInfo", safeValue(order.getTechnicianInfo()));
    //     return model;
    // }
    //
    // private String resolveItemName(Order order) {
    //     if (order.getTest() != null) {
    //         return order.getTest().getTestName();
    //     }
    //     if (order.getTestPackage() != null) {
    //         return order.getTestPackage().getPackageName();
    //     }
    //     return "-";
    // }
    //
    // private String renderTemplate(String template, Map<String, Object> model) {
    //     Context context = new Context();
    //     context.setVariables(model);
    //     return templateEngine.process(template, context);
    // }
    //
    // private String safeValue(String value) {
    //     return value == null || value.isBlank() ? "-" : value;
    // }
}