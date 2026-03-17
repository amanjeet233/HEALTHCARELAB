package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Order;
import com.healthcare.labtestbooking.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional
    public Order createOrder(Order order) {
        log.info("Creating order with reference: {}", order.getOrderReference());
        return orderRepository.save(order);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public void deleteOrder(Long id) {
        log.info("Deleting order with id: {}", id);
        orderRepository.deleteById(id);
    }

    // Placeholder for updateStatus which might be complex
    @Transactional
    public void updateStatus(Long orderId, com.healthcare.labtestbooking.entity.enums.OrderStatus status, String notes,
            String updatedBy) {
        log.info("Updating order status for id: {} to {}", orderId, status);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        orderRepository.save(order);
        // Relationship with OrderStatusHistory should ideally handle the history entry
    }
}
