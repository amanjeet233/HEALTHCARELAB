package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.SmartReportDTO;
import com.healthcare.labtestbooking.dto.TrendDataDTO;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.ReferenceRange;
import com.healthcare.labtestbooking.entity.Report;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.AbnormalStatus;
import com.healthcare.labtestbooking.entity.enums.ReportStatus;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.ReferenceRangeRepository;
import com.healthcare.labtestbooking.repository.ReportRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmartReportService {

    private final BookingRepository bookingRepository;
    private final ReportRepository reportRepository;
    private final ReportResultRepository reportResultRepository;
    private final ReferenceRangeRepository referenceRangeRepository;

    @Transactional
    public SmartReportDTO processReport(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        Report report = reportRepository.findByBookingId(bookingId)
            .orElseGet(() -> Report.builder()
                .booking(booking)
                .order(null)
                .patient(booking.getPatient())
                .status(ReportStatus.DRAFT)
                .generatedDate(LocalDateTime.now())
                .build());

        Report savedReport = report.getId() == null ? reportRepository.save(report) : report;
        List<ReportResult> results = reportResultRepository.findByBookingId(bookingId);

        for (ReportResult result : results) {
            enrichResult(result, booking.getPatient());
            result.setReport(savedReport);
            if (result.getTest() == null && result.getParameter() != null) {
                result.setTest(result.getParameter().getTest());
            }
        }
        reportResultRepository.saveAll(results);

        return buildSmartReport(savedReport, results, booking.getPatient());
    }

    public AbnormalStatus calculateStatus(String resultValue, ReferenceRange referenceRange, TestParameter parameter) {
        BigDecimal value = parseValue(resultValue);
        if (value == null) {
            return AbnormalStatus.NORMAL;
        }

        if (parameter != null) {
            if (parameter.getCriticalLow() != null && value.compareTo(parameter.getCriticalLow()) < 0) {
                return AbnormalStatus.CRITICAL_LOW;
            }
            if (parameter.getCriticalHigh() != null && value.compareTo(parameter.getCriticalHigh()) > 0) {
                return AbnormalStatus.CRITICAL_HIGH;
            }
        }

        if (referenceRange != null) {
            if (referenceRange.getNormalRangeMin() != null && value.compareTo(referenceRange.getNormalRangeMin()) < 0) {
                return AbnormalStatus.LOW;
            }
            if (referenceRange.getNormalRangeMax() != null && value.compareTo(referenceRange.getNormalRangeMax()) > 0) {
                return AbnormalStatus.HIGH;
            }
        }

        return AbnormalStatus.NORMAL;
    }

    @Transactional(readOnly = true)
    public TrendDataDTO generateTrends(Long patientId, Long testId, int limit) {
        List<ReportResult> all = reportResultRepository.findByBookingPatientIdOrderByCreatedAtDesc(patientId);
        List<ReportResult> filtered = all.stream()
            .filter(result -> result.getTest() != null && Objects.equals(result.getTest().getId(), testId))
            .limit(limit)
            .collect(Collectors.toList());

        List<String> labels = new ArrayList<>();
        List<BigDecimal> values = new ArrayList<>();
        for (ReportResult result : filtered) {
            if (result.getCreatedAt() != null) {
                labels.add(result.getCreatedAt().toLocalDate().toString());
            }
            BigDecimal value = parseValue(result.getResultValue());
            if (value != null) {
                values.add(value);
            }
        }

        String direction = calculateDirection(values);

        return TrendDataDTO.builder()
            .testId(testId)
            .labels(reverse(labels))
            .values(reverse(values))
            .direction(direction)
            .build();
    }

    @Transactional(readOnly = true)
    public List<SmartReportDTO.InsightDTO> generateInsights(Long reportId) {
        List<ReportResult> results = reportResultRepository.findByReportId(reportId);
        List<SmartReportDTO.InsightDTO> insights = new ArrayList<>();

        for (ReportResult result : results) {
            if (result.getAbnormalStatus() == null || result.getTest() == null) {
                continue;
            }
            String testName = result.getTest().getTestName();
            String parameterName = result.getParameter() != null ? result.getParameter().getParameterName() : "Result";
            if (result.getAbnormalStatus() == AbnormalStatus.HIGH) {
                insights.add(SmartReportDTO.InsightDTO.builder()
                    .message(parameterName + " is higher than the normal range for " + testName + ".")
                    .severity("WARNING")
                    .category("ABNORMAL")
                    .build());
            } else if (result.getAbnormalStatus() == AbnormalStatus.LOW) {
                insights.add(SmartReportDTO.InsightDTO.builder()
                    .message(parameterName + " is below the normal range for " + testName + ".")
                    .severity("WARNING")
                    .category("ABNORMAL")
                    .build());
            } else if (result.getAbnormalStatus() == AbnormalStatus.CRITICAL_HIGH
                || result.getAbnormalStatus() == AbnormalStatus.CRITICAL_LOW) {
                insights.add(SmartReportDTO.InsightDTO.builder()
                    .message("Critical value detected for " + parameterName + ". Immediate attention recommended.")
                    .severity("CRITICAL")
                    .category("CRITICAL")
                    .build());
            }
        }

        return insights;
    }

    @Transactional(readOnly = true)
    public List<SmartReportDTO.CriticalValueDTO> flagCriticalValues(Long reportId) {
        List<ReportResult> criticalResults = reportResultRepository.findByReportIdAndIsCriticalTrue(reportId);
        return criticalResults.stream()
            .map(result -> SmartReportDTO.CriticalValueDTO.builder()
                .reportResultId(result.getId())
                .testId(result.getTest() != null ? result.getTest().getId() : null)
                .parameterId(result.getParameter() != null ? result.getParameter().getId() : null)
                .parameterName(result.getParameter() != null ? result.getParameter().getParameterName() : null)
                .resultValue(result.getResultValue())
                .abnormalStatus(result.getAbnormalStatus())
                .message("Critical value requires immediate review")
                .build())
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SmartReportDTO getSmartReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));
        List<ReportResult> results = reportResultRepository.findByReportId(reportId);
        return buildSmartReport(report, results, report.getPatient());
    }

    private SmartReportDTO buildSmartReport(Report report, List<ReportResult> results, User patient) {
        List<SmartReportDTO.ResultItemDTO> items = results.stream()
            .map(this::toResultItem)
            .collect(Collectors.toList());

        List<SmartReportDTO.InsightDTO> insights = generateInsights(report.getId());
        List<SmartReportDTO.RiskScoreDTO> riskScores = generateRiskScores(results);
        List<SmartReportDTO.CriticalValueDTO> criticalValues = flagCriticalValues(report.getId());

        return SmartReportDTO.builder()
            .reportId(report.getId())
            .bookingId(report.getBooking() != null ? report.getBooking().getId() : null)
            .orderId(report.getOrder() != null ? report.getOrder().getId() : null)
            .patientId(patient != null ? patient.getId() : null)
            .status(report.getStatus())
            .generatedDate(report.getGeneratedDate())
            .results(items)
            .insights(insights)
            .riskScores(riskScores)
            .criticalValues(criticalValues)
            .build();
    }

    private SmartReportDTO.ResultItemDTO toResultItem(ReportResult result) {
        return SmartReportDTO.ResultItemDTO.builder()
            .reportResultId(result.getId())
            .testId(result.getTest() != null ? result.getTest().getId() : null)
            .parameterId(result.getParameter() != null ? result.getParameter().getId() : null)
            .testName(result.getTest() != null ? result.getTest().getTestName() : null)
            .parameterName(result.getParameter() != null ? result.getParameter().getParameterName() : null)
            .resultValue(result.getResultValue())
            .unit(result.getUnit())
            .normalRangeMin(result.getNormalRangeMin())
            .normalRangeMax(result.getNormalRangeMax())
            .abnormalStatus(result.getAbnormalStatus())
            .isAbnormal(result.getIsAbnormal())
            .isCritical(result.getIsCritical())
            .comments(result.getComments())
            .build();
    }

    private List<SmartReportDTO.RiskScoreDTO> generateRiskScores(List<ReportResult> results) {
        int cardio = 0;
        int diabetes = 0;
        int liver = 0;

        for (ReportResult result : results) {
            String name = result.getTest() != null ? result.getTest().getTestName() : "";
            String param = result.getParameter() != null ? result.getParameter().getParameterName() : "";
            String text = (name + " " + param).toLowerCase(Locale.ROOT);

            if (text.contains("cholesterol") || text.contains("lipid")) {
                cardio += riskPoints(result.getAbnormalStatus());
            }
            if (text.contains("glucose") || text.contains("hba1c") || text.contains("sugar")) {
                diabetes += riskPoints(result.getAbnormalStatus());
            }
            if (text.contains("liver") || text.contains("alt") || text.contains("ast")) {
                liver += riskPoints(result.getAbnormalStatus());
            }
        }

        return List.of(
            buildRisk("CARDIOVASCULAR", cardio),
            buildRisk("DIABETES", diabetes),
            buildRisk("LIVER", liver)
        );
    }
    private SmartReportDTO.RiskScoreDTO buildRisk(String type, int points) {
        int score = Math.min(100, points * 20);
        String level = score >= 70 ? "HIGH" : score >= 40 ? "MODERATE" : "LOW";
        return SmartReportDTO.RiskScoreDTO.builder()
            .type(type)
            .score(score)
            .level(level)
            .build();
    }

    private int riskPoints(AbnormalStatus status) {
        if (status == null) {
            return 0;
        }
        switch (status) {
            case CRITICAL_HIGH:
            case CRITICAL_LOW:
                return 5;
            case HIGH:
            case LOW:
                return 3;
            default:
                return 0;
        }
    }

    private void enrichResult(ReportResult result, User patient) {
        ReferenceRange referenceRange = findReferenceRange(result.getParameter(), patient);
        if (referenceRange != null) {
            result.setNormalRangeMin(referenceRange.getNormalRangeMin());
            result.setNormalRangeMax(referenceRange.getNormalRangeMax());
            if (result.getUnit() == null) {
                result.setUnit(referenceRange.getUnit());
            }
        }
        if (result.getUnit() == null && result.getParameter() != null) {
            result.setUnit(result.getParameter().getUnit());
        }

        AbnormalStatus status = calculateStatus(result.getResultValue(), referenceRange, result.getParameter());
        result.setAbnormalStatus(status);
        result.setIsAbnormal(status != null && status != AbnormalStatus.NORMAL);
        result.setIsCritical(status == AbnormalStatus.CRITICAL_LOW || status == AbnormalStatus.CRITICAL_HIGH);
    }

    private ReferenceRange findReferenceRange(TestParameter parameter, User patient) {
        if (parameter == null) {
            return null;
        }
        List<ReferenceRange> ranges = referenceRangeRepository.findByParameterId(parameter.getId());
        if (ranges.isEmpty()) {
            return null;
        }

        String gender = patient != null && patient.getGender() != null
            ? patient.getGender().name() : "ALL";
        BigDecimal age = patient != null ? calculateAge(patient.getDateOfBirth()) : null;

        return ranges.stream()
            .filter(range -> matchesGender(range, gender))
            .filter(range -> matchesAge(range, age))
            .sorted(Comparator.comparing((ReferenceRange r) -> r.getAgeMin() != null ? r.getAgeMin() : BigDecimal.ZERO))
            .findFirst()
            .orElse(ranges.get(0));
    }

    private boolean matchesGender(ReferenceRange range, String gender) {
        if (range.getGender() == null) {
            return true;
        }
        String rangeGender = range.getGender().toUpperCase(Locale.ROOT);
        return rangeGender.equals("ALL") || rangeGender.equals(gender);
    }

    private boolean matchesAge(ReferenceRange range, BigDecimal age) {
        if (age == null) {
            return true;
        }
        if (range.getAgeMin() != null && age.compareTo(range.getAgeMin()) < 0) {
            return false;
        }
        if (range.getAgeMax() != null && age.compareTo(range.getAgeMax()) > 0) {
            return false;
        }
        return true;
    }

    private BigDecimal calculateAge(LocalDate dob) {
        if (dob == null) {
            return null;
        }
        int years = Period.between(dob, LocalDate.now()).getYears();
        return BigDecimal.valueOf(years);
    }

    private BigDecimal parseValue(String resultValue) {
        if (resultValue == null || resultValue.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(resultValue.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String calculateDirection(List<BigDecimal> values) {
        if (values.size() < 2) {
            return "STABLE";
        }
        BigDecimal latest = values.get(0);
        BigDecimal oldest = values.get(values.size() - 1);
        if (latest.compareTo(oldest) > 0) {
            return "INCREASED";
        }
        if (latest.compareTo(oldest) < 0) {
            return "DECREASED";
        }
        return "STABLE";
    }

    private <T> List<T> reverse(List<T> list) {
        List<T> copy = new ArrayList<>(list);
        java.util.Collections.reverse(copy);
        return copy;
    }
}
