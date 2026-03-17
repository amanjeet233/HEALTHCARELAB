package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.Order;
import com.healthcare.labtestbooking.entity.OrderStatusHistory;
import com.healthcare.labtestbooking.service.OrderService;
import com.healthcare.labtestbooking.service.OrderStatusHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management")
public class OrderController {

    private final OrderService orderService;
    private final OrderStatusHistoryService orderStatusHistoryService;

    @GetMapping
    @Operation(summary = "Get all orders")
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success("Orders fetched successfully", orderService.getAllOrders()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse<Order>> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(o -> ResponseEntity.ok(ApiResponse.success("Order found", o)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an order")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order deleted successfully", null));
    }

    @GetMapping("/status-history/order/{orderId}")
    @Operation(summary = "Get status history for an order")
    public ResponseEntity<ApiResponse<List<OrderStatusHistory>>> getStatusHistory(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("History fetched successfully",
                orderStatusHistoryService.getHistoryForOrder(orderId)));
    }
}
