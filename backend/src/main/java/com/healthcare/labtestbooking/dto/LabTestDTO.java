package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabTestDTO {
    private Long id;
    private String testCode;
    private String testName;
    private String categoryName;
    private Long categoryId;
    private String testType;
    private String methodology;
    private String unit;
    private BigDecimal normalRangeMin;
    private BigDecimal normalRangeMax;
    private String normalRangeText;
    private Boolean fastingRequired;
    private Integer fastingHours;
    private Integer reportTimeHours;
    private BigDecimal price;
    private List<TestParameterDTO> parameters;
}
