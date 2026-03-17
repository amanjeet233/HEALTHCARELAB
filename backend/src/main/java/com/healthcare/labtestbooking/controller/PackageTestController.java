package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.PackageTestRequest;
import com.healthcare.labtestbooking.dto.PackageTestResponse;
import com.healthcare.labtestbooking.service.PackageTestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.healthcare.labtestbooking.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/package-tests")
@RequiredArgsConstructor
public class PackageTestController {

    private final PackageTestService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PackageTestResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PackageTestResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PackageTestResponse>> create(@Valid @RequestBody PackageTestRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Created", service.create(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PackageTestResponse>> update(@PathVariable Long id, @Valid @RequestBody PackageTestRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


