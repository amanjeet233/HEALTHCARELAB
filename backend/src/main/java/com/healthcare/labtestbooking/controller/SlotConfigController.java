package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.SlotConfigRequest;
import com.healthcare.labtestbooking.dto.SlotConfigResponse;
import com.healthcare.labtestbooking.service.SlotConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/slot-configs")
@RequiredArgsConstructor
public class SlotConfigController {

    private final SlotConfigService service;

    @GetMapping
    public ResponseEntity<List<SlotConfigResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SlotConfigResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<SlotConfigResponse> create(@Valid @RequestBody SlotConfigRequest request) {
        return new ResponseEntity<>(service.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SlotConfigResponse> update(@PathVariable Long id, @Valid @RequestBody SlotConfigRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
