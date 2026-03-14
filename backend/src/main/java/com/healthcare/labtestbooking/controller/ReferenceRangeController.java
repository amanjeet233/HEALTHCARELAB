package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.ReferenceRangeRequest;
import com.healthcare.labtestbooking.dto.ReferenceRangeResponse;
import com.healthcare.labtestbooking.service.ReferenceRangeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/reference-ranges")
@RequiredArgsConstructor
public class ReferenceRangeController {

    private final ReferenceRangeService service;

    @GetMapping
    public ResponseEntity<List<ReferenceRangeResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReferenceRangeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<ReferenceRangeResponse> create(@Valid @RequestBody ReferenceRangeRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReferenceRangeResponse> update(@PathVariable Long id, @Valid @RequestBody ReferenceRangeRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
