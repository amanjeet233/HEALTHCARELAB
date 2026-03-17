package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.service.TestParameterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-parameters")
@RequiredArgsConstructor
@Tag(name = "Test Parameters", description = "Management of lab test parameters")
public class TestParameterController {

    private final TestParameterService testParameterService;

    @GetMapping("/test/{testId}")
    @Operation(summary = "Get parameters for a specific test")
    public ResponseEntity<ApiResponse<List<TestParameter>>> getByTestId(@PathVariable Long testId) {
        return ResponseEntity.ok(ApiResponse.success("Parameters fetched successfully",
                testParameterService.getParametersByTestId(testId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get test parameter by ID")
    public ResponseEntity<ApiResponse<TestParameter>> getById(@PathVariable Long id) {
        return testParameterService.getParameterById(id)
                .map(p -> ResponseEntity.ok(ApiResponse.success("Parameter found", p)))
                .orElse(ResponseEntity.notFound().build());
    }
}
