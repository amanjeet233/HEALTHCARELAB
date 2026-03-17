package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.service.TestPackageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-packages")
@RequiredArgsConstructor
@Tag(name = "Test Packages", description = "Management of lab test packages")
public class TestPackageController {

    private final TestPackageService testPackageService;

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
}
