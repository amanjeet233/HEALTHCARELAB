package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.OrderStatusHistory;
import com.healthcare.labtestbooking.repository.OrderStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrderStatusHistoryService {

    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Transactional
    public OrderStatusHistory saveHistory(OrderStatusHistory history) {
        log.info("Saving order status history for order id: {}", history.getOrder().getId());
        return orderStatusHistoryRepository.save(history);
    }

    public List<OrderStatusHistory> getHistoryForOrder(Long orderId) {
        return orderStatusHistoryRepository.findByOrderIdOrderByChangedAtDesc(orderId);
    }

    public List<OrderStatusHistory> getAllHistory() {
        return orderStatusHistoryRepository.findAll();
    }
}
