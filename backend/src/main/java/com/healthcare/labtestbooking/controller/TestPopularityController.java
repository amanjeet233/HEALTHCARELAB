package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.TestPopularityRequest;
import com.healthcare.labtestbooking.dto.TestPopularityResponse;
import com.healthcare.labtestbooking.service.TestPopularityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/test-popularitys")
@RequiredArgsConstructor
public class TestPopularityController {

    private final TestPopularityService service;

    @GetMapping
    public ResponseEntity<List<TestPopularityResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestPopularityResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<TestPopularityResponse> create(@Valid @RequestBody TestPopularityRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestPopularityResponse> update(@PathVariable Long id, @Valid @RequestBody TestPopularityRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
