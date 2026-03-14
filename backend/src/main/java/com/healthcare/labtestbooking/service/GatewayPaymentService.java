package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.GatewayPayment;
import com.healthcare.labtestbooking.repository.GatewayPaymentRepository;
import com.healthcare.labtestbooking.dto.GatewayPaymentRequest;
import com.healthcare.labtestbooking.dto.GatewayPaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GatewayPaymentService {

    private final GatewayPaymentRepository repository;

    @Transactional(readOnly = true)
    public List<GatewayPaymentResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GatewayPaymentResponse getById(Long id) {
        GatewayPayment entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("GatewayPayment not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public GatewayPaymentResponse create(GatewayPaymentRequest request) {
        GatewayPayment entity = new GatewayPayment();
        // map request to entity here
        GatewayPayment saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public GatewayPaymentResponse update(Long id, GatewayPaymentRequest request) {
        GatewayPayment entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("GatewayPayment not found with id " + id));
        // update entity from request here
        GatewayPayment updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private GatewayPaymentResponse mapToResponse(GatewayPayment entity) {
        GatewayPaymentResponse response = new GatewayPaymentResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
