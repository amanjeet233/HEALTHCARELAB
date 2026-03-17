package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.ReferenceRange;
import com.healthcare.labtestbooking.service.ReferenceRangeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reference-ranges")
@RequiredArgsConstructor
@Tag(name = "Reference Ranges", description = "Management of parameter reference ranges")
public class ReferenceRangeController {

    private final ReferenceRangeService referenceRangeService;

    @GetMapping
    @Operation(summary = "Get all reference ranges")
    public ResponseEntity<ApiResponse<List<ReferenceRange>>> getAllReferenceRanges() {
        return ResponseEntity.ok(ApiResponse.success("Reference ranges fetched successfully",
                referenceRangeService.getAllReferenceRanges()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get reference range by ID")
    public ResponseEntity<ApiResponse<ReferenceRange>> getById(@PathVariable Long id) {
        return referenceRangeService.getReferenceRangeById(id)
                .map(r -> ResponseEntity.ok(ApiResponse.success("Reference range found", r)))
                .orElse(ResponseEntity.notFound().build());
    }
}
