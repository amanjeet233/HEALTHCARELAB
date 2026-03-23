package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.*;
import com.healthcare.labtestbooking.entity.Order;
import com.healthcare.labtestbooking.entity.OrderStatusHistory;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.OrderStatus;
import com.healthcare.labtestbooking.exception.ResourceNotFoundException;
import com.healthcare.labtestbooking.repository.UserRepository;
import com.healthcare.labtestbooking.service.OrderPaymentService;
import com.healthcare.labtestbooking.service.OrderService;
import com.healthcare.labtestbooking.service.OrderStatusHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Orders", description = "Order management")
public class OrderController {

    private final OrderService orderService;
    private final OrderStatusHistoryService orderStatusHistoryService;
    private final UserRepository userRepository;
    private final OrderPaymentService orderPaymentService;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @Operation(summary = "Create order from cart", description = "Convert cart items into an order")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrderFromCart(
            @Valid @RequestBody OrderRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        // Extract userId from authentication context (would typically be added during login)
        // For now, using email - in production, store userId in security context
        OrderResponse response = orderService.createOrderFromCart(
                extractUserIdFromAuth(authentication),
                request
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @Operation(summary = "Get user's orders", description = "Retrieve all orders for the authenticated user")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getUserOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<OrderResponse> orders = orderService.getUserOrdersAsResponse(
                extractUserIdFromAuth(authentication),
                pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Orders fetched successfully", orders));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all orders", description = "Retrieve all orders (Admin only)")
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success("Orders fetched successfully", orderService.getAllOrders()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse<Order>> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(o -> ResponseEntity.ok(ApiResponse.success("Order found", o)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status", description = "Update the status of an order")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status,
            @RequestParam(required = false) String notes,
            Authentication authentication) {
        String updatedBy = extractUserEmailFromAuth(authentication);
        OrderResponse response = orderService.updateStatus(id, status, notes, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @Operation(summary = "Delete an order", description = "Delete a pending order")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order deleted successfully", null));
    }

    @GetMapping("/{orderId}/status-history")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @Operation(summary = "Get status history for an order")
    public ResponseEntity<ApiResponse<List<OrderStatusHistory>>> getStatusHistory(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("History fetched successfully",
                orderStatusHistoryService.getHistoryForOrder(orderId)));
    }

    @PostMapping("/{orderId}/initiate-payment")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @Operation(summary = "Initiate payment for order", description = "Create Razorpay payment order and get payment link")
    public ResponseEntity<ApiResponse<OrderPaymentService.PaymentInitiationResponse>> initiatePayment(
            @PathVariable Long orderId,
            @Valid @RequestBody PaymentInitiationRequest request,
            Authentication authentication) {
        Long userId = extractUserIdFromAuth(authentication);
        OrderPaymentService.PaymentInitiationResponse response = orderPaymentService.initiatePaymentForOrder(
                orderId,
                userId,
                request.getEmail(),
                request.getPhone()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment link generated", response));
    }

    @GetMapping("/{orderId}/payment-status")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @Operation(summary = "Get payment status for order")
    public ResponseEntity<ApiResponse<OrderPaymentService.OrderPaymentStatus>> getPaymentStatus(
            @PathVariable Long orderId) {
        OrderPaymentService.OrderPaymentStatus response = orderPaymentService.getOrderPaymentStatus(orderId);
        return ResponseEntity.ok(ApiResponse.success("Payment status retrieved", response));
    }

    @PostMapping("/payment/razorpay-callback")
    @Operation(summary = "Razorpay payment webhook", description = "Handle payment success/failure callbacks from Razorpay")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody java.util.Map<String, Object> payload) {
        try {
            log.info("Razorpay webhook received");
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            log.error("Webhook processing failed", e);
            return ResponseEntity.badRequest().body("Webhook processing failed: " + e.getMessage());
        }
    }

    private Long extractUserIdFromAuth(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }

    private String extractUserEmailFromAuth(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userDetails.getUsername();
    }
}
