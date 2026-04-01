package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.LabTestDTO;
import com.healthcare.labtestbooking.dto.TestPackageDTO;
import com.healthcare.labtestbooking.entity.enums.TestType;
import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.service.LabTestService;
import com.healthcare.labtestbooking.service.TestPackageService;
import com.healthcare.labtestbooking.service.TestPopularityService;
import com.healthcare.labtestbooking.entity.TestPopularity;
import io.swagger.v3.oas.annotations.Operation;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/lab-tests")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true")
@Tag(name = "Lab Tests", description = "Lab tests and test packages catalog - Public browsing")
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
        private final TestPopularityService testPopularityService;
        
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

        @GetMapping("/trending")
        @Operation(summary = "Get trending tests", description = "Retrieve top 10 trending lab tests")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Trending tests retrieved successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<List<LabTestDTO>>> getTrendingTests() {
                log.info("GET /api/lab-tests/trending - Fetching top trending tests");
                List<LabTestDTO> trendingTests = labTestService.getTrendingTests();
                return ResponseEntity.ok(ApiResponse.success("Trending tests retrieved successfully", trendingTests));
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

        @GetMapping("/popularity")
        @Operation(summary = "Get all test popularity stats")
        public ResponseEntity<ApiResponse<List<TestPopularity>>> getPopularityStats() {
                return ResponseEntity.ok(ApiResponse.success("Popularity stats fetched successfully",
                        testPopularityService.getPopularityStats()));
        }

        @PostMapping("/popularity/increment/{testId}")
        @Operation(summary = "Increment popularity for a test")
        public ResponseEntity<ApiResponse<TestPopularity>> incrementPopularity(@PathVariable Long testId) {
                return ResponseEntity
                        .ok(ApiResponse.success("Popularity incremented", testPopularityService.incrementPopularity(testId)));
        }

        @GetMapping("/packages")
        @Operation(summary = "Get all test packages", description = "Retrieve all active test packages")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Packages fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<List<TestPackage>>> getAllPackages() {
                log.info("GET /api/lab-tests/packages - Fetching all packages");
                List<TestPackage> packages = testPackageService.getAllPackages();
                return ResponseEntity.ok(ApiResponse.success("Packages fetched successfully", packages));
        }

        @GetMapping("/packages/{id}")
        @Operation(summary = "Get package by ID", description = "Retrieve a specific test package by its ID")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Package fetched successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Package not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<TestPackage>> getPackageById(@PathVariable Long id) {
                log.info("GET /api/lab-tests/packages/{}", id);
                return testPackageService.getPackageById(id)
                        .map(pkg -> ResponseEntity.ok(ApiResponse.success("Package fetched successfully", pkg)))
                        .orElse(ResponseEntity.notFound().build());
        }
}



