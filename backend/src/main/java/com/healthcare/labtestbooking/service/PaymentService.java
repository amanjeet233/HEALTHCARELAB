package com.healthcare.labtestbooking.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.dto.CreatePaymentOrderRequest;
import com.healthcare.labtestbooking.dto.PaymentLinkResponse;
import com.healthcare.labtestbooking.dto.PaymentRequest;
import com.healthcare.labtestbooking.dto.PaymentResponse;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.GatewayPayment;
import com.healthcare.labtestbooking.entity.Payment;
import com.healthcare.labtestbooking.entity.enums.PaymentMethod;
import com.healthcare.labtestbooking.entity.enums.PaymentStatus;
import com.healthcare.labtestbooking.entity.enums.RefundStatus;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.GatewayPaymentRepository;
import com.healthcare.labtestbooking.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final GatewayPaymentRepository gatewayPaymentRepository;
    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    @Value("${app.payment.webhook.secret}")
    private String webhookSecret;

    @Value("${app.payment.mock-base-url}")
    private String mockBaseUrl;

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + request.getBookingId()));

        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Payment already processed for this booking");
        }

        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = Payment.builder()
                .booking(booking)
                .transactionId(transactionId)
                .amount(request.getAmount())
                .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()))
                .status(PaymentStatus.PENDING)
                .build();

        try {
            boolean paymentSuccessful = processExternalPayment(request);

            if (paymentSuccessful) {
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setPaymentDate(LocalDateTime.now());
                payment.setGatewayTransactionId(request.getTransactionId());

                booking.setPaymentStatus(PaymentStatus.PAID);
                bookingRepository.save(booking);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Payment processing failed");
            }
        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(e.getMessage());
        }

        payment = paymentRepository.save(payment);
        return mapToResponse(payment);
    }

    @Transactional
    public String generateInvoice(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));

        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new RuntimeException("Invoice can only be generated for completed payments");
        }

        String invoiceNumber = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        StringBuilder invoice = new StringBuilder();
        invoice.append("INVOICE\n");
        invoice.append("========\n");
        invoice.append("Invoice Number: ").append(invoiceNumber).append("\n");
        invoice.append("Payment ID: ").append(payment.getId()).append("\n");
        invoice.append("Transaction ID: ").append(payment.getTransactionId()).append("\n");
        invoice.append("Booking ID: ").append(payment.getBooking().getId()).append("\n");
        invoice.append("Patient: ").append(payment.getBooking().getPatient().getName()).append("\n");
        invoice.append("Test: ").append(payment.getBooking().getTest().getTestName()).append("\n");
        invoice.append("Amount: $").append(payment.getAmount()).append("\n");
        invoice.append("Payment Method: ").append(payment.getPaymentMethod()).append("\n");
        invoice.append("Payment Date: ").append(payment.getPaymentDate()).append("\n");
        invoice.append("Status: ").append(payment.getStatus()).append("\n");

        payment.setInvoiceNumber(invoiceNumber);
        paymentRepository.save(payment);

        return invoice.toString();
    }

    @Transactional
    public PaymentResponse processRefund(Long paymentId, BigDecimal refundAmount, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));

        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new RuntimeException("Refund can only be processed for completed payments");
        }

        if (refundAmount.compareTo(payment.getAmount()) > 0) {
            throw new RuntimeException("Refund amount cannot exceed original payment amount");
        }

        Payment refund = Payment.builder()
                .booking(payment.getBooking())
                .transactionId("REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .amount(refundAmount.negate())
                .paymentMethod(payment.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .isRefund(true)
                .refundStatus(RefundStatus.PENDING)
                .refundReason(reason)
                .originalPaymentId(payment.getId())
                .build();

        try {
            boolean refundSuccessful = processExternalRefund(refundAmount, payment.getPaymentMethod());

            if (refundSuccessful) {
                refund.setStatus(PaymentStatus.COMPLETED);
                refund.setRefundStatus(RefundStatus.COMPLETED);
                refund.setPaymentDate(LocalDateTime.now());

                payment.setRefundStatus(RefundStatus.COMPLETED);
                paymentRepository.save(payment);
            } else {
                refund.setStatus(PaymentStatus.FAILED);
                refund.setRefundStatus(RefundStatus.FAILED);
                refund.setFailureReason("Refund processing failed");
            }
        } catch (Exception e) {
            refund.setStatus(PaymentStatus.FAILED);
            refund.setRefundStatus(RefundStatus.FAILED);
            refund.setFailureReason(e.getMessage());
        }

        refund = paymentRepository.save(refund);
        return mapToResponse(refund);
    }

    public List<PaymentResponse> getPaymentHistory(Long userId) {
        List<Payment> payments = paymentRepository.findByBookingPatientIdOrderByPaymentDateDesc(userId);
        return payments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getBookingPayments(Long bookingId) {
        List<Payment> payments = paymentRepository.findByBookingIdOrderByPaymentDateDesc(bookingId);
        return payments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentLinkResponse createGatewayPayment(CreatePaymentOrderRequest request) {
        String transactionId = "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        String paymentLink = mockBaseUrl + "?transactionId=" + transactionId;

        GatewayPayment payment = GatewayPayment.builder()
                .orderId(request.getOrderId())
                .amount(request.getAmount())
                .gateway(request.getGateway())
                .transactionId(transactionId)
                .status(PaymentStatus.PENDING)
                .paymentLink(paymentLink)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        GatewayPayment saved = gatewayPaymentRepository.save(payment);

        return PaymentLinkResponse.builder()
                .paymentId(saved.getId())
                .paymentLink(saved.getPaymentLink())
                .transactionId(saved.getTransactionId())
                .status(saved.getStatus().name())
                .build();
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (!isValidSignature(payload, signature)) {
            throw new RuntimeException("Invalid webhook signature");
        }

        WebhookPayload webhookPayload = parsePayload(payload);
        GatewayPayment payment = gatewayPaymentRepository.findByTransactionId(webhookPayload.transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found for transaction: " + webhookPayload.transactionId));

        PaymentStatus newStatus = mapStatus(webhookPayload.status);
        payment.setStatus(newStatus);
        payment.setUpdatedAt(LocalDateTime.now());
        gatewayPaymentRepository.save(payment);

        if (newStatus == PaymentStatus.SUCCESS) {
            orderService.updateStatus(payment.getOrderId(),
                    com.healthcare.labtestbooking.entity.enums.OrderStatus.PAYMENT_COMPLETED,
                    "Payment success via webhook",
                    "system");
        }
    }

    private boolean processExternalPayment(PaymentRequest request) {
        return true;
    }

    private boolean processExternalRefund(BigDecimal amount, PaymentMethod paymentMethod) {
        return true;
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod().name())
                .status(payment.getStatus().name())
                .paymentDate(payment.getPaymentDate())
                .invoiceNumber(payment.getInvoiceNumber())
                .isRefund(payment.getIsRefund())
                .refundStatus(payment.getRefundStatus() != null ? payment.getRefundStatus().name() : null)
                .refundReason(payment.getRefundReason())
                .failureReason(payment.getFailureReason())
                .gatewayTransactionId(payment.getTransactionId())
                .build();
    }

    private boolean isValidSignature(String payload, String signature) {
        if (signature == null || signature.isBlank()) {
            return false;
        }
        String expected = hmacSha256(payload, webhookSecret);
        return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8));
    }

    private String hmacSha256(String payload, String secret) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec keySpec = new javax.crypto.spec.SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : raw) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to compute webhook signature", ex);
        }
    }

    private WebhookPayload parsePayload(String payload) {
        try {
            return objectMapper.readValue(payload, WebhookPayload.class);
        } catch (Exception ex) {
            throw new RuntimeException("Invalid webhook payload", ex);
        }
    }

    private PaymentStatus mapStatus(String status) {
        if (status == null) {
            return PaymentStatus.FAILED;
        }
        return switch (status.toUpperCase(Locale.ROOT)) {
            case "PENDING" -> PaymentStatus.PENDING;
            case "SUCCESS" -> PaymentStatus.SUCCESS;
            case "FAILED" -> PaymentStatus.FAILED;
            case "REFUNDED" -> PaymentStatus.REFUNDED;
            default -> PaymentStatus.FAILED;
        };
    }

    private static class WebhookPayload {
        public Long orderId;
        public BigDecimal amount;
        public String gateway;
        public String transactionId;
        public String status;
    }
}
