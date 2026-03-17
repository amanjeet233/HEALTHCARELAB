package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.PackageTestRequest;
import com.healthcare.labtestbooking.dto.PackageTestResponse;
import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.service.TestPackageService;
import com.healthcare.labtestbooking.service.PackageTestService;
import com.healthcare.labtestbooking.service.TestPackageService;
import com.healthcare.labtestbooking.service.PackageTestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/test-packages")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Test Packages", description = "Management of lab test packages")
public class TestPackageController {

    private final TestPackageService testPackageService;
    private final PackageTestService packageTestService;

    @GetMapping
    @Operation(summary = "Get all test packages")
    public ResponseEntity<ApiResponse<List<TestPackage>>> getAllPackages() {
        return ResponseEntity
                .ok(ApiResponse.success("Packages fetched successfully", testPackageService.getAllPackages()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get test package by ID")
    public ResponseEntity<ApiResponse<TestPackage>> getPackageById(@PathVariable Long id) {
        return testPackageService.getPackageById(id)
                .map(p -> ResponseEntity.ok(ApiResponse.success("Package found", p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/package-tests")
    @Operation(summary = "Get all package-test relationships")
    public ResponseEntity<ApiResponse<List<PackageTestResponse>>> getAllPackageTests() {
        return ResponseEntity.ok(ApiResponse.success("Success", packageTestService.getAll()));
    }

    @GetMapping("/package-tests/{id}")
    @Operation(summary = "Get package-test relationship by ID")
    public ResponseEntity<ApiResponse<PackageTestResponse>> getPackageTestById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Success", packageTestService.getById(id)));
    }

    @PostMapping("/package-tests")
    @Operation(summary = "Create package-test relationship")
    public ResponseEntity<ApiResponse<PackageTestResponse>> createPackageTest(@Valid @RequestBody PackageTestRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Created", packageTestService.create(request)), HttpStatus.CREATED);
    }

    @PutMapping("/package-tests/{id}")
    @Operation(summary = "Update package-test relationship")
    public ResponseEntity<ApiResponse<PackageTestResponse>> updatePackageTest(@PathVariable Long id, @Valid @RequestBody PackageTestRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Success", packageTestService.update(id, request)));
    }

    @DeleteMapping("/package-tests/{id}")
    @Operation(summary = "Delete package-test relationship")
    public ResponseEntity<ApiResponse<Void>> deletePackageTest(@PathVariable Long id) {
        packageTestService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
