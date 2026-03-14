package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.OrderStatusHistoryRequest;
import com.healthcare.labtestbooking.dto.OrderStatusHistoryResponse;
import com.healthcare.labtestbooking.service.OrderStatusHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/order-status-historys")
@RequiredArgsConstructor
public class OrderStatusHistoryController {

    private final OrderStatusHistoryService service;

    @GetMapping
    public ResponseEntity<List<OrderStatusHistoryResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderStatusHistoryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<OrderStatusHistoryResponse> create(@Valid @RequestBody OrderStatusHistoryRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderStatusHistoryResponse> update(@PathVariable Long id, @Valid @RequestBody OrderStatusHistoryRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
