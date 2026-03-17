package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.GatewayPayment;
import com.healthcare.labtestbooking.service.GatewayPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gateway-payments")
@RequiredArgsConstructor
@Tag(name = "Gateway Payments", description = "Direct gateway payment record management")
public class GatewayPaymentController {

    private final GatewayPaymentService gatewayPaymentService;

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    @Operation(summary = "Get gateway payments for an order")
    public ResponseEntity<ApiResponse<List<GatewayPayment>>> getPaymentsByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("Payments fetched successfully",
                gatewayPaymentService.getGatewayPaymentsByOrderId(orderId)));
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<ApiResponse<GatewayPayment>> getPaymentByTransactionId(@PathVariable String transactionId) {
        return gatewayPaymentService.getGatewayPaymentByTransactionId(transactionId)
                .map(p -> ResponseEntity.ok(ApiResponse.success("Payment found", p)))
                .orElse(ResponseEntity.notFound().build());
    }
}
