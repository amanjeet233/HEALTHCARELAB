package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.DoctorAvailabilityRequest;
import com.healthcare.labtestbooking.dto.DoctorAvailabilityResponse;
import com.healthcare.labtestbooking.service.DoctorAvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/doctor-availabilitys")
@RequiredArgsConstructor
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService service;

    @GetMapping
    public ResponseEntity<List<DoctorAvailabilityResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorAvailabilityResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<DoctorAvailabilityResponse> create(@Valid @RequestBody DoctorAvailabilityRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorAvailabilityResponse> update(@PathVariable Long id, @Valid @RequestBody DoctorAvailabilityRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
