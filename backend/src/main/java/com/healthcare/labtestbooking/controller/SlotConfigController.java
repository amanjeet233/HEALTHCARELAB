package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.SlotConfig;
import com.healthcare.labtestbooking.service.SlotConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slot-configs")
@RequiredArgsConstructor
@Tag(name = "Slot Configurations", description = "Management of daily appointment slot configurations")
public class SlotConfigController {

    private final SlotConfigService slotConfigService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all slot configurations")
    public ResponseEntity<ApiResponse<List<SlotConfig>>> getAllConfigs() {
        return ResponseEntity
                .ok(ApiResponse.success("Configs fetched successfully", slotConfigService.getAllConfigs()));
    }

    @GetMapping("/day/{dayOfWeek}")
    @Operation(summary = "Get configuration for a specific day")
    public ResponseEntity<ApiResponse<SlotConfig>> getByDay(@PathVariable String dayOfWeek) {
        return slotConfigService.getConfigByDay(dayOfWeek)
                .map(c -> ResponseEntity.ok(ApiResponse.success("Config found", c)))
                .orElse(ResponseEntity.notFound().build());
    }
}
