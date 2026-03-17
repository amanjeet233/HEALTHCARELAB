package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.LabTestPricingRequest;
import com.healthcare.labtestbooking.dto.LabTestPricingResponse;
import com.healthcare.labtestbooking.service.LabTestPricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.healthcare.labtestbooking.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/lab-test-pricings")
@RequiredArgsConstructor
public class LabTestPricingController {

    private final LabTestPricingService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LabTestPricingResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LabTestPricingResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LabTestPricingResponse>> create(@Valid @RequestBody LabTestPricingRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Created", service.create(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LabTestPricingResponse>> update(@PathVariable Long id, @Valid @RequestBody LabTestPricingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


