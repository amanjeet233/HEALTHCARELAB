package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.UserHealthDataRequest;
import com.healthcare.labtestbooking.dto.UserHealthDataResponse;
import com.healthcare.labtestbooking.service.UserHealthDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.healthcare.labtestbooking.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/user-health-datas")
@RequiredArgsConstructor
public class UserHealthDataController {

    private final UserHealthDataService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserHealthDataResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserHealthDataResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Success", service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserHealthDataResponse>> create(@Valid @RequestBody UserHealthDataRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Created", service.create(request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserHealthDataResponse>> update(@PathVariable Long id, @Valid @RequestBody UserHealthDataRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


