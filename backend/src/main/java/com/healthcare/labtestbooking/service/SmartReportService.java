package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.enums.AbnormalStatus;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SmartReportService {

    private final ReportResultRepository reportResultRepository;
    private final BookingRepository bookingRepository;

    public Map<String, Object> getSmartAnalysis(Long bookingId) {
        log.info("Generating smart analysis for booking ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        
        List<ReportResult> results = reportResultRepository.findByBookingId(bookingId);
        
        if (results.isEmpty()) {
            throw new RuntimeException("No report results found for booking: " + bookingId);
        }

        Map<String, Object> analysis = new LinkedHashMap<>();
        analysis.put("bookingId", bookingId);
        analysis.put("testName", booking.getTest() != null ? booking.getTest().getTestName() : "Unknown");
        analysis.put("totalParameters", results.size());

        long normalCount = results.stream().filter(r -> r.getAbnormalStatus() == AbnormalStatus.NORMAL).count();
        long abnormalCount = results.stream().filter(r -> r.getIsAbnormal() != null && r.getIsAbnormal()).count();
        long criticalCount = results.stream().filter(r -> r.getIsCritical() != null && r.getIsCritical()).count();

        analysis.put("normalCount", normalCount);
        analysis.put("abnormalCount", abnormalCount);
        analysis.put("criticalCount", criticalCount);

        int healthScore = calculateHealthScore(results);
        analysis.put("healthScore", healthScore);
        analysis.put("healthStatus", getHealthStatus(healthScore));

        List<Map<String, Object>> findings = new ArrayList<>();
        for (ReportResult result : results) {
            if (result.getIsAbnormal() != null && result.getIsAbnormal()) {
                Map<String, Object> finding = new LinkedHashMap<>();
                finding.put("parameter", result.getParameter().getParameterName());
                finding.put("value", result.getResultValue());
                finding.put("unit", result.getUnit());
                finding.put("status", result.getAbnormalStatus().name());
                finding.put("isCritical", result.getIsCritical());
                finding.put("recommendation", getRecommendation(result));
                findings.add(finding);
            }
        }
        analysis.put("abnormalFindings", findings);
        analysis.put("summary", generateSummary(normalCount, abnormalCount, criticalCount, results.size()));
        analysis.put("analyzedAt", LocalDateTime.now());

        return analysis;
    }

    public Map<String, Object> getParameterTrend(Long bookingId, Long testId) {
        log.info("Getting parameter trends for booking {} and test {}", bookingId, testId);

        Booking currentBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        Long patientId = currentBooking.getPatient().getId();
        List<Booking> patientBookings = bookingRepository.findByPatientId(patientId);

        List<Map<String, Object>> trendData = new ArrayList<>();
        for (Booking booking : patientBookings) {
            if (booking.getTest() != null && booking.getTest().getId().equals(testId)) {
                List<ReportResult> results = reportResultRepository.findByBookingId(booking.getId());
                if (!results.isEmpty()) {
                    Map<String, Object> dataPoint = new LinkedHashMap<>();
                    dataPoint.put("bookingId", booking.getId());
                    dataPoint.put("date", booking.getCreatedAt());
                    Map<String, Object> parameters = new LinkedHashMap<>();
                    for (ReportResult result : results) {
                        Map<String, Object> paramData = new LinkedHashMap<>();
                        paramData.put("value", result.getResultValue());
                        paramData.put("unit", result.getUnit());
                        paramData.put("status", result.getAbnormalStatus() != null ? result.getAbnormalStatus().name() : "NORMAL");
                        parameters.put(result.getParameter().getParameterName(), paramData);
                    }
                    dataPoint.put("parameters", parameters);
                    trendData.add(dataPoint);
                }
            }
        }

        trendData.sort((a, b) -> {
            LocalDateTime dateA = (LocalDateTime) a.get("date");
            LocalDateTime dateB = (LocalDateTime) b.get("date");
            if (dateA == null || dateB == null) return 0;
            return dateA.compareTo(dateB);
        });

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("patientId", patientId);
        response.put("testId", testId);
        response.put("testName", currentBooking.getTest() != null ? currentBooking.getTest().getTestName() : "Unknown");
        response.put("totalDataPoints", trendData.size());
        response.put("trendData", trendData);
        if (trendData.size() >= 2) {
            response.put("trendAnalysis", analyzeTrends(trendData));
        }

        return response;
    }

    public Map<String, Object> getCriticalValues(Long bookingId) {
        log.info("Getting critical values for booking ID: {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        List<ReportResult> results = reportResultRepository.findByBookingId(bookingId);
        if (results.isEmpty()) {
            throw new RuntimeException("No report results found for booking: " + bookingId);
        }

        List<Map<String, Object>> criticalValues = results.stream()
                .filter(r -> r.getIsCritical() != null && r.getIsCritical())
                .map(this::mapResultToDetail).collect(Collectors.toList());

        List<Map<String, Object>> abnormalValues = results.stream()
                .filter(r -> r.getIsAbnormal() != null && r.getIsAbnormal() && (r.getIsCritical() == null || !r.getIsCritical()))
                .map(this::mapResultToDetail).collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("bookingId", bookingId);
        response.put("testName", booking.getTest() != null ? booking.getTest().getTestName() : "Unknown");
        response.put("criticalCount", criticalValues.size());
        response.put("abnormalCount", abnormalValues.size());
        response.put("criticalValues", criticalValues);
        response.put("abnormalValues", abnormalValues);
        response.put("requiresImmediateAttention", !criticalValues.isEmpty());
        if (!criticalValues.isEmpty()) {
            response.put("urgentMessage", "CRITICAL VALUES DETECTED - Immediate medical consultation recommended");
        }
        return response;
    }

    private Map<String, Object> mapResultToDetail(ReportResult result) {
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("id", result.getId());
        detail.put("parameter", result.getParameter().getParameterName());
        detail.put("value", result.getResultValue());
        detail.put("unit", result.getUnit());
        detail.put("normalRange", result.getNormalRange());
        detail.put("status", result.getAbnormalStatus() != null ? result.getAbnormalStatus().name() : "UNKNOWN");
        detail.put("isCritical", result.getIsCritical());
        detail.put("notes", result.getNotes());
        return detail;
    }

    private int calculateHealthScore(List<ReportResult> results) {
        if (results.isEmpty()) return 100;
        int totalScore = 0;
        for (ReportResult result : results) {
            if (result.getIsCritical() != null && result.getIsCritical()) totalScore += 0;
            else if (result.getIsAbnormal() != null && result.getIsAbnormal()) totalScore += 50;
            else totalScore += 100;
        }
        return totalScore / results.size();
    }

    private String getHealthStatus(int score) {
        if (score >= 90) return "EXCELLENT";
        if (score >= 75) return "GOOD";
        if (score >= 50) return "FAIR";
        if (score >= 25) return "CONCERNING";
        return "CRITICAL";
    }

    private String getRecommendation(ReportResult result) {
        if (result.getAbnormalStatus() == null) return "No specific recommendation";
        switch (result.getAbnormalStatus()) {
            case CRITICAL_HIGH: return "URGENT: Extremely high value - seek immediate medical attention";
            case CRITICAL_LOW: return "URGENT: Extremely low value - seek immediate medical attention";
            case HIGH: return "Elevated value - consult with your healthcare provider";
            case LOW: return "Below normal - discuss with your healthcare provider";
            default: return "Value within normal range";
        }
    }

    private String generateSummary(long normal, long abnormal, long critical, int total) {
        if (critical > 0) return String.format("ATTENTION REQUIRED: %d critical value(s) detected. Please consult a healthcare provider immediately.", critical);
        if (abnormal > 0) return String.format("Some values outside normal range: %d of %d parameters abnormal. Schedule a follow-up consultation.", abnormal, total);
        return String.format("All %d parameters within normal range. Continue maintaining a healthy lifestyle.", total);
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> analyzeTrends(List<Map<String, Object>> trendData) {
        Map<String, String> trends = new LinkedHashMap<>();
        if (trendData.size() < 2) return trends;
        Map<String, Object> first = trendData.get(0);
        Map<String, Object> last = trendData.get(trendData.size() - 1);
        Map<String, Object> firstParams = (Map<String, Object>) first.get("parameters");
        Map<String, Object> lastParams = (Map<String, Object>) last.get("parameters");
        if (firstParams == null || lastParams == null) return trends;
        for (String paramName : lastParams.keySet()) {
            if (firstParams.containsKey(paramName)) {
                try {
                    Map<String, Object> firstData = (Map<String, Object>) firstParams.get(paramName);
                    Map<String, Object> lastData = (Map<String, Object>) lastParams.get(paramName);
                    String firstValue = (String) firstData.get("value");
                    String lastValue = (String) lastData.get("value");
                    if (firstValue != null && lastValue != null) {
                        BigDecimal fv = new BigDecimal(firstValue);
                        BigDecimal lv = new BigDecimal(lastValue);
                        int cmp = lv.compareTo(fv);
                        if (cmp > 0) trends.put(paramName, "INCREASING");
                        else if (cmp < 0) trends.put(paramName, "DECREASING");
                        else trends.put(paramName, "STABLE");
                    }
                } catch (Exception e) {
                    log.debug("Could not analyze trend for parameter: {}", paramName);
                }
            }
        }
        return trends;
    }
}
