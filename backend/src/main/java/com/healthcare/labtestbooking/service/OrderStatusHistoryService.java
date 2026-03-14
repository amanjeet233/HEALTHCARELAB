package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.OrderStatusHistory;
import com.healthcare.labtestbooking.repository.OrderStatusHistoryRepository;
import com.healthcare.labtestbooking.dto.OrderStatusHistoryRequest;
import com.healthcare.labtestbooking.dto.OrderStatusHistoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderStatusHistoryService {

    private final OrderStatusHistoryRepository repository;

    @Transactional(readOnly = true)
    public List<OrderStatusHistoryResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderStatusHistoryResponse getById(Long id) {
        OrderStatusHistory entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderStatusHistory not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public OrderStatusHistoryResponse create(OrderStatusHistoryRequest request) {
        OrderStatusHistory entity = new OrderStatusHistory();
        // map request to entity here
        OrderStatusHistory saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public OrderStatusHistoryResponse update(Long id, OrderStatusHistoryRequest request) {
        OrderStatusHistory entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderStatusHistory not found with id " + id));
        // update entity from request here
        OrderStatusHistory updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private OrderStatusHistoryResponse mapToResponse(OrderStatusHistory entity) {
        OrderStatusHistoryResponse response = new OrderStatusHistoryResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
