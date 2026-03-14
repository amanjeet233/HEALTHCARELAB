package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.enums.AbnormalStatus;
import com.healthcare.labtestbooking.entity.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmartReportDTO {

    private Long reportId;
    private Long bookingId;
    private Long orderId;
    private Long patientId;
    private ReportStatus status;
    private LocalDateTime generatedDate;
    private List<ResultItemDTO> results;
    private List<InsightDTO> insights;
    private List<RiskScoreDTO> riskScores;
    private List<CriticalValueDTO> criticalValues;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultItemDTO {
        private Long reportResultId;
        private Long testId;
        private Long parameterId;
        private String testName;
        private String parameterName;
        private String resultValue;
        private String unit;
        private BigDecimal normalRangeMin;
        private BigDecimal normalRangeMax;
        private AbnormalStatus abnormalStatus;
        private Boolean isAbnormal;
        private Boolean isCritical;
        private String comments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InsightDTO {
        private String message;
        private String severity;
        private String category;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskScoreDTO {
        private String type;
        private Integer score;
        private String level;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CriticalValueDTO {
        private Long reportResultId;
        private Long testId;
        private Long parameterId;
        private String parameterName;
        private String resultValue;
        private AbnormalStatus abnormalStatus;
        private String message;
    }
}
