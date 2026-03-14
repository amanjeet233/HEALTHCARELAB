package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.HealthScoreResponse;
import com.healthcare.labtestbooking.dto.HealthTrendResponse;
import com.healthcare.labtestbooking.entity.HealthScore;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.AbnormalStatus;
import com.healthcare.labtestbooking.entity.enums.RiskLevel;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.HealthScoreRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthScoreService {

        private final HealthScoreRepository healthScoreRepository;
        private final ReportResultRepository reportResultRepository;
        private final UserRepository userRepository;
        private final BookingRepository bookingRepository;

        public HealthScoreResponse calculateHealthScore(Long bookingId) {
                List<ReportResult> results = reportResultRepository.findByBookingId(bookingId);

                if (results.isEmpty()) {
                        throw new RuntimeException("No report results found for booking with id: " + bookingId);
                }

                long normalCount = results.stream()
                                .filter(result -> result.getAbnormalStatus() == AbnormalStatus.NORMAL)
                                .count();

                long totalCount = results.size();
                BigDecimal overallScore = BigDecimal.valueOf(normalCount)
                                .multiply(BigDecimal.valueOf(100))
                                .divide(BigDecimal.valueOf(totalCount), 2, RoundingMode.HALF_UP);

                RiskLevel riskLevel = determineRiskLevel(overallScore);

                Map<String, BigDecimal> bodySystemScores = generateBodySystemScores(results);

                return HealthScoreResponse.builder()
                                .bookingId(bookingId)
                                .overallScore(overallScore)
                                .riskLevel(riskLevel.name())
                                .cardiovascularScore(bodySystemScores.getOrDefault("Cardiovascular", BigDecimal.ZERO))
                                .metabolicScore(bodySystemScores.getOrDefault("Metabolic", BigDecimal.ZERO))
                                .renalScore(bodySystemScores.getOrDefault("Renal", BigDecimal.ZERO))
                                .hepaticScore(bodySystemScores.getOrDefault("Hepatic", BigDecimal.ZERO))
                                .endocrineScore(bodySystemScores.getOrDefault("Endocrine", BigDecimal.ZERO))
                                .calculatedAt(LocalDateTime.now())
                                .build();
        }

        public RiskLevel determineRiskLevel(BigDecimal score) {
                if (score.compareTo(BigDecimal.valueOf(90)) >= 0) {
                        return RiskLevel.LOW;
                } else if (score.compareTo(BigDecimal.valueOf(70)) >= 0) {
                        return RiskLevel.MODERATE;
                } else if (score.compareTo(BigDecimal.valueOf(50)) >= 0) {
                        return RiskLevel.HIGH;
                } else {
                        return RiskLevel.CRITICAL;
                }
        }

        public Map<String, BigDecimal> generateBodySystemScores(List<ReportResult> results) {
                return results.stream()
                                .collect(Collectors.groupingBy(
                                                result -> result.getParameter().getTest() != null
                                                                ? result.getParameter().getTest().getTestName()
                                                                : "General",
                                                Collectors.collectingAndThen(
                                                                Collectors.toList(),
                                                                systemResults -> {
                                                                        long normalCount = systemResults.stream()
                                                                                        .filter(result -> result
                                                                                                        .getAbnormalStatus() == AbnormalStatus.NORMAL)
                                                                                        .count();
                                                                        return BigDecimal.valueOf(normalCount)
                                                                                        .multiply(BigDecimal
                                                                                                        .valueOf(100))
                                                                                        .divide(BigDecimal.valueOf(
                                                                                                        systemResults.size()),
                                                                                                        2,
                                                                                                        RoundingMode.HALF_UP);
                                                                })));
        }

        public List<HealthTrendResponse> trackHealthTrends(Long userId, int months) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

                LocalDateTime startDate = LocalDateTime.now().minusMonths(months);

                List<HealthScore> healthScores = healthScoreRepository
                                .findByPatientIdAndCreatedAtAfterOrderByCreatedAtDesc(userId, startDate);

                return healthScores.stream()
                                .map(this::mapToTrendResponse)
                                .collect(Collectors.toList());
        }

        public List<HealthTrendResponse> getMyHealthTrends(int months) {
                User currentUser = getCurrentUser();
                return trackHealthTrends(currentUser.getId(), months);
        }

        @Transactional
        public HealthScore saveHealthScore(Long bookingId) {
                HealthScoreResponse response = calculateHealthScore(bookingId);

                HealthScore healthScore = HealthScore.builder()
                                .booking(bookingRepository.findById(bookingId)
                                                .orElseThrow(() -> new RuntimeException(
                                                                "Booking not found with id: " + bookingId)))
                                .overallScore(response.getOverallScore())
                                .riskLevel(RiskLevel.valueOf(response.getRiskLevel()))
                                .cardiovascularScore(response.getCardiovascularScore())
                                .metabolicScore(response.getMetabolicScore())
                                .renalScore(response.getRenalScore())
                                .hepaticScore(response.getHepaticScore())
                                .endocrineScore(response.getEndocrineScore())
                                .build();

                return healthScoreRepository.save(healthScore);
        }

        public HealthScoreResponse getLatestHealthScore(Long userId) {
                HealthScore latestScore = healthScoreRepository
                                .findFirstByPatientIdOrderByCreatedAtDesc(userId)
                                .orElseThrow(() -> new RuntimeException(
                                                "No health scores found for user with id: " + userId));

                return HealthScoreResponse.builder()
                                .bookingId(latestScore.getBooking().getId())
                                .overallScore(latestScore.getOverallScore())
                                .riskLevel(latestScore.getRiskLevel().name())
                                .cardiovascularScore(latestScore.getCardiovascularScore())
                                .metabolicScore(latestScore.getMetabolicScore())
                                .renalScore(latestScore.getRenalScore())
                                .hepaticScore(latestScore.getHepaticScore())
                                .endocrineScore(latestScore.getEndocrineScore())
                                .calculatedAt(latestScore.getCreatedAt())
                                .build();
        }

        private User getCurrentUser() {
                UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                                .getAuthentication().getPrincipal();
                return userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
        }

        private HealthTrendResponse mapToTrendResponse(HealthScore healthScore) {
                return HealthTrendResponse.builder()
                                .date(healthScore.getCreatedAt().toLocalDate())
                                .overallScore(healthScore.getOverallScore())
                                .riskLevel(healthScore.getRiskLevel().name())
                                .cardiovascularScore(healthScore.getCardiovascularScore())
                                .metabolicScore(healthScore.getMetabolicScore())
                                .renalScore(healthScore.getRenalScore())
                                .hepaticScore(healthScore.getHepaticScore())
                                .endocrineScore(healthScore.getEndocrineScore())
                                .build();
        }

    public java.util.List<com.healthcare.labtestbooking.dto.HealthScoreResponse> getAll() { return java.util.List.of(); }
    public com.healthcare.labtestbooking.dto.HealthScoreResponse getById(Long id) { return null; }
    public com.healthcare.labtestbooking.dto.HealthScoreResponse create(com.healthcare.labtestbooking.dto.HealthScoreRequest request) { return null; }
    public com.healthcare.labtestbooking.dto.HealthScoreResponse update(Long id, com.healthcare.labtestbooking.dto.HealthScoreRequest request) { return null; }
    public void delete(Long id) { }
}

