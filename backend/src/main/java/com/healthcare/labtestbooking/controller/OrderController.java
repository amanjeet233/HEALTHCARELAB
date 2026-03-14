package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.Order;
import com.healthcare.labtestbooking.entity.OrderStatusHistory;
import com.healthcare.labtestbooking.entity.enums.OrderStatus;
import com.healthcare.labtestbooking.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Orders", description = "Order management and status tracking")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create order", description = "Create a new lab test order")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Order created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid order data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Order>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        log.info("POST /api/orders");
        Order order = orderService.createOrder(
            request.getUserId(),
            request.getTestId(),
            request.getPackageId(),
            request.getPaymentInfo(),
            request.getSlotInfo()
        );
        return ResponseEntity.ok(ApiResponse.success("Order created", order));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Retrieve a specific order by its ID")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Order fetched successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Order not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Order>> getOrder(@PathVariable Long id) {
        Order order = orderService.getOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order fetched", order));
    }

    @GetMapping("/{id}/timeline")
    @Operation(summary = "Get order timeline", description = "Retrieve status change timeline for an order")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Order timeline retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Order not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<List<OrderStatusHistory>>> getTimeline(@PathVariable Long id) {
        List<OrderStatusHistory> timeline = orderService.getOrderTimeline(id);
        return ResponseEntity.ok(ApiResponse.success("Order timeline", timeline));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel order", description = "Cancel an existing order")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Order cancelled successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Order not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Order>> cancelOrder(
        @PathVariable Long id,
        @Valid @RequestBody CancelOrderRequest request
    ) {
        Order order = orderService.cancelOrder(id, request.getReason(), request.getChangedBy());
        return ResponseEntity.ok(ApiResponse.success("Cancellation requested", order));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Update the status of an order")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Order status updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Order not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Order>> updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody UpdateStatusRequest request
    ) {
        Order order = orderService.updateStatus(id, request.getStatus(), request.getNote(), request.getChangedBy());
        return ResponseEntity.ok(ApiResponse.success("Status updated", order));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class CreateOrderRequest {
        @NotNull(message = "User ID is required")
        @Positive(message = "User ID must be positive")
        private Long userId;

        @Positive(message = "Test ID must be positive")
        private Long testId;

        @Positive(message = "Package ID must be positive")
        private Long packageId;

        @Size(max = 500, message = "Payment info must be at most 500 characters")
        private String paymentInfo;

        @Size(max = 200, message = "Slot info must be at most 200 characters")
        private String slotInfo;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class CancelOrderRequest {
        @NotBlank(message = "Cancellation reason is required")
        @Size(max = 500, message = "Reason must be at most 500 characters")
        private String reason;

        @Size(max = 100, message = "Changed by must be at most 100 characters")
        private String changedBy;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class UpdateStatusRequest {
        @NotNull(message = "Status is required")
        private OrderStatus status;

        @Size(max = 500, message = "Note must be at most 500 characters")
        private String note;

        @Size(max = 100, message = "Changed by must be at most 100 characters")
        private String changedBy;
    }
}
