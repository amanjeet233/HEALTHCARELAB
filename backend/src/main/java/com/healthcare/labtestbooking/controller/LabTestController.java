package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.LabTestDTO;
import com.healthcare.labtestbooking.dto.TestPackageDTO;
import com.healthcare.labtestbooking.entity.enums.TestType;
import com.healthcare.labtestbooking.service.LabTestService;
import com.healthcare.labtestbooking.service.TestPackageService;
import io.swagger.v3.oas.annotations.Operation;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/lab-tests")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Lab Tests", description = "Lab tests and test packages catalog")
public class LabTestController {
        @GetMapping("/popular")
        @Operation(summary = "Get popular tests", description = "Retrieve a list of most booked lab tests")
        public ResponseEntity<ApiResponse<List<LabTestDTO>>> getPopularTests() {
                log.info("GET /api/lab-tests/popular");
                List<LabTestDTO> tests = labTestService.getPopularTests();
                return ResponseEntity.ok(ApiResponse.success("Popular tests retrieved", tests));
        }

        private final LabTestService labTestService;
        private final TestPackageService testPackageService;
        
        @GetMapping
        @Operation(summary = "Get all lab tests", description = "Retrieve all active lab tests with pagination")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tests fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> getAllTests(
                        @PageableDefault(size = 20, sort = "testName") Pageable pageable) {
                log.info("GET /api/lab-tests - Fetching all active tests | Page: {}, Size: {}",
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<LabTestDTO> tests = labTestService.getAllActiveTests(pageable);
                return ResponseEntity.ok(ApiResponse.success("Tests fetched successfully", tests));
        }

        @GetMapping("/api/tests")
        @Operation(summary = "Get all tests (alias)", description = "Retrieve all active lab tests")
        public ResponseEntity<ApiResponse<List<LabTestDTO>>> getAllTestsLegacy() {
                log.info("GET /api/tests - Fetching all active tests (legacy/requested)");
                List<LabTestDTO> tests = labTestService.getAllActiveTests();
                return ResponseEntity.ok(ApiResponse.success("Tests fetched successfully", tests));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get test by ID", description = "Retrieve a specific lab test by its ID")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Test fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Test not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<LabTestDTO>> getTestById(@PathVariable Long id) {
                log.info("GET /api/lab-tests/{}", id);
                LabTestDTO test = labTestService.getTestById(id);
                return ResponseEntity.ok(ApiResponse.success("Test fetched successfully", test));
        }

        @GetMapping("/code/{testCode}")
        @Operation(summary = "Get test by code", description = "Retrieve a lab test by its unique code")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Test fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Test not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<LabTestDTO>> getTestByCode(@PathVariable String testCode) {
                log.info("GET /api/lab-tests/code/{}", testCode);
                LabTestDTO test = labTestService.getTestByCode(testCode);
                return ResponseEntity.ok(ApiResponse.success("Test fetched successfully", test));
        }

        @GetMapping("/category/{categoryId}")
        @Operation(summary = "Get tests by category", description = "Retrieve all lab tests in a specific category")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tests fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Category not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> getTestsByCategory(
                        @PathVariable Long categoryId,
                        @PageableDefault(size = 20, sort = "testName") Pageable pageable) {
                log.info("GET /api/lab-tests/category/{} | Page: {}, Size: {}", categoryId,
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<LabTestDTO> tests = labTestService.getTestsByCategory(categoryId, pageable);
                return ResponseEntity.ok(ApiResponse.success("Tests fetched successfully", tests));
        }

        @GetMapping("/type/{testType}")
        @Operation(summary = "Get tests by type", description = "Retrieve all lab tests of a specific type")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tests fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> getTestsByType(
                        @PathVariable TestType testType,
                        @PageableDefault(size = 20, sort = "testName") Pageable pageable) {
                log.info("GET /api/lab-tests/type/{} | Page: {}, Size: {}", testType,
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<LabTestDTO> tests = labTestService.getTestsByType(testType, pageable);
                return ResponseEntity.ok(ApiResponse.success("Tests fetched successfully", tests));
        }

        @GetMapping("/search")
        @Operation(summary = "Search tests", description = "Search lab tests by keyword (name, description, etc.)")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Search results returned"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid search keyword"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> searchTests(
                        @RequestParam String keyword,
                        @PageableDefault(size = 20, sort = "testName") Pageable pageable) {
                log.info("GET /api/lab-tests/search?keyword={} | Page: {}, Size: {}", keyword,
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<LabTestDTO> tests = labTestService.searchTests(keyword, pageable);
                return ResponseEntity.ok(ApiResponse.success("Search results", tests));
        }

        @GetMapping("/price-range")
        @Operation(summary = "Get tests by price range", description = "Retrieve lab tests within a specific price range")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tests fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid price range"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<LabTestDTO>>> getTestsByPriceRange(
                        @RequestParam BigDecimal min,
                        @RequestParam BigDecimal max,
                        @PageableDefault(size = 20, sort = "basePrice") Pageable pageable) {
                log.info("GET /api/lab-tests/price-range?min={}&max={} | Page: {}, Size: {}", min, max,
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<LabTestDTO> tests = labTestService.getTestsByPriceRange(min, max, pageable);
                return ResponseEntity.ok(ApiResponse.success("Tests fetched successfully", tests));
        }

        @GetMapping("/types")
        @Operation(summary = "Get all test types", description = "Retrieve all available test types")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Test types fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<List<TestType>>> getAllTestTypes() {
                log.info("GET /api/lab-tests/types");
                List<TestType> types = labTestService.getAllTestTypes();
                return ResponseEntity.ok(ApiResponse.success("Test types fetched successfully", types));
        }

        // Package endpoints - commented out due to missing TestPackageService methods
        /*
        @GetMapping("/packages")
        @Operation(summary = "Get all test packages", description = "Retrieve all active test packages with pagination")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Packages fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<Page<TestPackageDTO>>> getAllPackages(
                        @PageableDefault(size = 20, sort = "packageName") Pageable pageable) {
                log.info("GET /api/lab-tests/packages - Fetching all packages | Page: {}, Size: {}",
                                pageable.getPageNumber(), pageable.getPageSize());
                Page<TestPackageDTO> packages = testPackageService.getAllActivePackages(pageable);
                return ResponseEntity.ok(ApiResponse.success("Packages fetched successfully", packages));
        }

        @GetMapping("/packages/{id}")
        @Operation(summary = "Get package by ID", description = "Retrieve a specific test package by its ID")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Package fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Package not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<TestPackageDTO>> getPackageById(@PathVariable Long id) {
                log.info("GET /api/lab-tests/packages/{}", id);
                TestPackageDTO testPackage = testPackageService.getPackageById(id);
                return ResponseEntity.ok(ApiResponse.success("Package fetched successfully", testPackage));
        }

        @GetMapping("/packages/code/{packageCode}")
        @Operation(summary = "Get package by code", description = "Retrieve a test package by its unique code")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Package fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Package not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<TestPackageDTO>> getPackageByCode(@PathVariable String packageCode) {
                log.info("GET /api/lab-tests/packages/code/{}", packageCode);
                TestPackageDTO testPackage = testPackageService.getPackageByCode(packageCode);
                return ResponseEntity.ok(ApiResponse.success("Package fetched successfully", testPackage));
        }

        @GetMapping("/packages/best-deals")
        @Operation(summary = "Get best deals", description = "Retrieve test packages with the best deals and discounts")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Best deals fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<List<TestPackageDTO>>> getBestDeals() {
                log.info("GET /api/lab-tests/packages/best-deals");
                List<TestPackageDTO> deals = testPackageService.getBestDeals();
                return ResponseEntity.ok(ApiResponse.success("Best deals fetched successfully", deals));
        }
        */
}



