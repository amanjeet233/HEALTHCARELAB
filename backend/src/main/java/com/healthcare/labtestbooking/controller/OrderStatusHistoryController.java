package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.OrderStatusHistory;
import com.healthcare.labtestbooking.service.OrderStatusHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-status-history")
@RequiredArgsConstructor
@Tag(name = "Order Status History", description = "Management of order state transitions")
public class OrderStatusHistoryController {

    private final OrderStatusHistoryService orderStatusHistoryService;

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get status history for an order")
    public ResponseEntity<ApiResponse<List<OrderStatusHistory>>> getHistoryForOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("History fetched successfully",
                orderStatusHistoryService.getHistoryForOrder(orderId)));
    }
}
