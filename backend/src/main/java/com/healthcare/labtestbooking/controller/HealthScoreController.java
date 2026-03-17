package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.HealthScoreRequest;
import com.healthcare.labtestbooking.dto.HealthScoreResponse;
import com.healthcare.labtestbooking.service.HealthScoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.healthcare.labtestbooking.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/health-scores")
@RequiredArgsConstructor
public class HealthScoreController {

    private final HealthScoreService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HealthScoreResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HealthScoreResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HealthScoreResponse>> create(@Valid @RequestBody HealthScoreRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Created", service.create(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HealthScoreResponse>> update(@PathVariable Long id, @Valid @RequestBody HealthScoreRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


