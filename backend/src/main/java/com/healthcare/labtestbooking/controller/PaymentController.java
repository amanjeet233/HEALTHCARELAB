package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.CreatePaymentOrderRequest;
import com.healthcare.labtestbooking.dto.PaymentLinkResponse;
import com.healthcare.labtestbooking.dto.PaymentRequest;
import com.healthcare.labtestbooking.dto.PaymentResponse;
import com.healthcare.labtestbooking.entity.GatewayPayment;
import com.healthcare.labtestbooking.service.PaymentService;
import com.healthcare.labtestbooking.service.GatewayPaymentService;
import io.swagger.v3.oas.annotations.Operation;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment processing and invoicing")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final PaymentService paymentService;
    private final GatewayPaymentService gatewayPaymentService;

    @PostMapping("/process")
    @Operation(summary = "Process payment", description = "Process a payment for a booking")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Payment processed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid payment details"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment processed", response));
    }

    @PostMapping("/create-order")
    @Operation(summary = "Create payment order", description = "Create a payment order and get payment link from gateway")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Payment order created, link provided"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid order data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error or gateway unavailable")
    })
    public ResponseEntity<ApiResponse<PaymentLinkResponse>> createPaymentOrder(
            @Valid @RequestBody CreatePaymentOrderRequest request) {
        PaymentLinkResponse response = paymentService.createGatewayPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment link created", response));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Payment webhook", description = "Handle payment gateway webhook callbacks (unsigned - validate signature in payload)")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Webhook processed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid webhook signature or payload"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Void>> handleWebhook(
            @Valid @RequestBody String payload,
            @RequestHeader(name = "X-Signature", required = false) String signature) {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get booking payments", description = "Retrieve all payments for a specific booking")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payments retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getBookingPayments(
            @PathVariable Long bookingId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PaymentResponse> payments = paymentService.getBookingPayments(bookingId, pageable);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    @GetMapping({"/history/{userId}", "/history"})
    @Operation(summary = "Get payment history", description = "Retrieve payment history for a user")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payment history retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getPaymentHistory(
            @PathVariable(required = false) Long userId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PaymentResponse> payments = paymentService.getPaymentHistory(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    @GetMapping("/invoice/{paymentId}")
    @Operation(summary = "Generate invoice", description = "Generate invoice for a specific payment")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Invoice generated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Payment not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<String>> generateInvoice(@PathVariable Long paymentId) {
        String invoice = paymentService.generateInvoice(paymentId);
        return ResponseEntity.ok(ApiResponse.success("Invoice generated", invoice));
    }

    @GetMapping("/gateway/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    @Operation(summary = "Get gateway payments for an order")
    public ResponseEntity<ApiResponse<List<GatewayPayment>>> getGatewayPaymentsByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("Payments fetched successfully",
                gatewayPaymentService.getGatewayPaymentsByOrderId(orderId)));
    }

    @GetMapping("/gateway/transaction/{transactionId}")
    @Operation(summary = "Get payment by transaction ID")
    public ResponseEntity<ApiResponse<GatewayPayment>> getPaymentByTransactionId(@PathVariable String transactionId) {
        return gatewayPaymentService.getGatewayPaymentByTransactionId(transactionId)
                .map(p -> ResponseEntity.ok(ApiResponse.success("Payment found", p)))
                .orElse(ResponseEntity.notFound().build());
    }
}


