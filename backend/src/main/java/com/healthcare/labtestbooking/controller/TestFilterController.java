package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.FilterRequestDTO;
import com.healthcare.labtestbooking.dto.FilterResponseDTO;
import com.healthcare.labtestbooking.service.FilterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/tests")
@RequiredArgsConstructor
@Slf4j
public class TestFilterController {

    private final FilterService filterService;

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<FilterResponseDTO>> filterTests(
        @RequestParam(required = false) String gender,
        @RequestParam(required = false) String organ,
        @RequestParam(required = false) String testType,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) BigDecimal discountMin,
        @RequestParam(required = false) String reportTime,
        @RequestParam(required = false) Boolean fasting,
        @RequestParam(required = false) String sortBy,
        @RequestParam(defaultValue = "0") Integer page,
        @RequestParam(defaultValue = "20") Integer size
    ) {
        log.info("GET /api/tests/filter");
        FilterRequestDTO request = FilterRequestDTO.builder()
            .gender(gender)
            .organ(organ)
            .testType(testType)
            .minPrice(minPrice)
            .maxPrice(maxPrice)
            .discountMin(discountMin)
            .reportTime(reportTime)
            .fasting(fasting)
            .sortBy(sortBy)
            .page(page)
            .size(size)
            .build();

        FilterResponseDTO response = filterService.filterTests(request);
        return ResponseEntity.ok(ApiResponse.success("Filter results", response));
    }
}
