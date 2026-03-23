package com.healthcare.labtestbooking.service;

import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@Service
@Slf4j
@RequiredArgsConstructor
public class RazorpayService {

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.webhook-secret}")
    private String webhookSecret;

    @Value("${app.payment.currency:INR}")
    private String currency;

    private RazorpayClient razorpayClient;

    /**
     * Initialize Razorpay client (called once)
     */
    private synchronized void initializeClient() {
        if (razorpayClient == null) {
            try {
                razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                log.info("Razorpay client initialized successfully");
            } catch (Exception e) {
                log.error("Failed to initialize Razorpay client", e);
                throw new RuntimeException("Razorpay initialization failed", e);
            }
        }
    }

    /**
     * Create a payment order in Razorpay
     */
    public Object createOrder(
            BigDecimal amount,
            Long orderId,
            String email,
            String phone,
            String description) {

        initializeClient();

        try {
            // Convert rupees to paise (100 paise = 1 rupee)
            long amountInPaise = amount.multiply(BigDecimal.valueOf(100)).longValue();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", "ORD-" + orderId);
            orderRequest.put("notes", new JSONObject()
                    .put("orderId", orderId)
                    .put("email", email)
                    .put("phone", phone));

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            String orderId_str = String.valueOf(razorpayOrder.get("id"));
            log.info("Razorpay order created with ID: " + orderId_str);
            return razorpayOrder;

        } catch (Exception e) {
            log.error("Error creating Razorpay order for orderId: {}", orderId, e);
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    /**
     * Verify payment signature from Razorpay webhook
     */
    public boolean verifyPaymentSignature(
            String razorpayOrderId,
            String razorpayPaymentId,
            String signature) {

        try {
            // Create string to sign in format: orderId|paymentId
            String payload = razorpayOrderId + "|" + razorpayPaymentId;

            // Generate HMAC-SHA256 signature
            String calculatedSignature = calculateSignature(payload, webhookSecret);

            // Compare signatures using constant-time comparison
            boolean isValid = constantTimeEquals(calculatedSignature, signature);

            if (isValid) {
                log.info("Payment signature verified for order: {}, payment: {}",
                        razorpayOrderId, razorpayPaymentId);
            } else {
                log.warn("Invalid payment signature for order: {}, payment: {}",
                        razorpayOrderId, razorpayPaymentId);
            }

            return isValid;

        } catch (Exception e) {
            log.error("Error verifying payment signature", e);
            return false;
        }
    }

    /**
     * Calculate HMAC-SHA256 signature
     */
    private String calculateSignature(String data, String secret)
            throws NoSuchAlgorithmException, InvalidKeyException {

        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
        );
        mac.init(secretKey);

        byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder result = new StringBuilder();

        for (byte b : hmacBytes) {
            result.append(String.format("%02x", b));
        }

        return result.toString();
    }

    /**
     * Constant-time string comparison to prevent timing attacks
     */
    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return a == b;
        }

        byte[] aBytes = a.getBytes(StandardCharsets.UTF_8);
        byte[] bBytes = b.getBytes(StandardCharsets.UTF_8);

        int result = 0;
        if (aBytes.length != bBytes.length) {
            result = 1;
        }

        for (int i = 0; i < Math.min(aBytes.length, bBytes.length); i++) {
            result |= aBytes[i] ^ bBytes[i];
        }

        return result == 0;
    }
}
