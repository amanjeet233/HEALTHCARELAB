package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.HealthScoreResponse;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.AbnormalStatus;
import com.healthcare.labtestbooking.entity.enums.RiskLevel;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.HealthScoreRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HealthScoreServiceTest {

    @Mock
    private HealthScoreRepository healthScoreRepository;

    @Mock
    private ReportResultRepository reportResultRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private HealthScoreService healthScoreService;

    private User patient;
    private Booking booking;
    private ReportResult normalResult;
    private ReportResult abnormalResult;
    private ReportResult criticalResult;

    @BeforeEach
    void setUp() {
        patient = new User();
        patient.setId(1L);
        patient.setName("John Doe");
        patient.setEmail("john@example.com");
        patient.setRole(UserRole.PATIENT);

        booking = new Booking();
        booking.setId(1L);
        booking.setBookingReference("BK-HEALTH123");
        booking.setPatient(patient);
        booking.setBookingDate(LocalDate.now());

        TestParameter parameter = new TestParameter();
        parameter.setId(1L);
        parameter.setParameterName("Hemoglobin");

        normalResult = new ReportResult();
        normalResult.setId(1L);
        normalResult.setBooking(booking);
        normalResult.setParameter(parameter);
        normalResult.setResultValue("14.5");
        normalResult.setAbnormalStatus(AbnormalStatus.NORMAL);
        normalResult.setCreatedAt(LocalDateTime.now());

        abnormalResult = new ReportResult();
        abnormalResult.setId(2L);
        abnormalResult.setBooking(booking);
        abnormalResult.setParameter(parameter);
        abnormalResult.setResultValue("10.5");
        abnormalResult.setAbnormalStatus(AbnormalStatus.LOW);
        abnormalResult.setCreatedAt(LocalDateTime.now());

        criticalResult = new ReportResult();
        criticalResult.setId(3L);
        criticalResult.setBooking(booking);
        criticalResult.setParameter(parameter);
        criticalResult.setResultValue("8.0");
        criticalResult.setAbnormalStatus(AbnormalStatus.LOW);
        criticalResult.setIsCritical(true);
        criticalResult.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void calculateHealthScore_Success() {
        // Given
        List<ReportResult> results = Arrays.asList(normalResult, abnormalResult);
        when(reportResultRepository.findByBookingId(1L)).thenReturn(results);

        // When
        HealthScoreResponse response = healthScoreService.calculateHealthScore(1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getBookingId());
        assertEquals(new BigDecimal("50.00"), response.getOverallScore()); // 1 normal out of 2 = 50%
        assertEquals("HIGH", response.getRiskLevel()); // 50% score = HIGH risk
        assertNotNull(response.getCalculatedAt());
        assertNotNull(response.getCardiovascularScore());
        assertNotNull(response.getMetabolicScore());

        verify(reportResultRepository).findByBookingId(1L);
    }

    @Test
    void calculateHealthScore_NoResults_ThrowsException() {
        // Given
        when(reportResultRepository.findByBookingId(1L)).thenReturn(Arrays.asList());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            healthScoreService.calculateHealthScore(1L));
        
        assertEquals("No report results found for booking with id: 1", exception.getMessage());
        verify(reportResultRepository).findByBookingId(1L);
    }

    @Test
    void determineRiskLevel_LowRisk() {
        // When
        RiskLevel riskLevel = healthScoreService.determineRiskLevel(new BigDecimal("95.00"));

        // Then
        assertEquals(RiskLevel.LOW, riskLevel);
    }

    @Test
    void determineRiskLevel_ModerateRisk() {
        // When
        RiskLevel riskLevel = healthScoreService.determineRiskLevel(new BigDecimal("80.00"));

        // Then
        assertEquals(RiskLevel.MODERATE, riskLevel);
    }

    @Test
    void determineRiskLevel_HighRisk() {
        // When
        RiskLevel riskLevel = healthScoreService.determineRiskLevel(new BigDecimal("60.00"));

        // Then
        assertEquals(RiskLevel.HIGH, riskLevel);
    }

    @Test
    void determineRiskLevel_CriticalRisk() {
        // When
        RiskLevel riskLevel = healthScoreService.determineRiskLevel(new BigDecimal("30.00"));

        // Then
        assertEquals(RiskLevel.CRITICAL, riskLevel);
    }

    @Test
    void determineRiskLevel_BoundaryValues() {
        // Test exact boundary values
        assertEquals(RiskLevel.LOW, healthScoreService.determineRiskLevel(new BigDecimal("90.00")));
        assertEquals(RiskLevel.MODERATE, healthScoreService.determineRiskLevel(new BigDecimal("70.00")));
        assertEquals(RiskLevel.HIGH, healthScoreService.determineRiskLevel(new BigDecimal("50.00")));
        assertEquals(RiskLevel.CRITICAL, healthScoreService.determineRiskLevel(new BigDecimal("49.99")));
    }

    @Test
    void generateBodySystemScores_Success() {
        // Given
        TestParameter cardioParam = new TestParameter();
        cardioParam.setId(1L);
        cardioParam.setParameterName("Cholesterol");

        TestParameter metabolicParam = new TestParameter();
        metabolicParam.setId(2L);
        metabolicParam.setParameterName("Glucose");

        ReportResult cardioNormal = new ReportResult();
        cardioNormal.setParameter(cardioParam);
        cardioNormal.setAbnormalStatus(AbnormalStatus.NORMAL);

        ReportResult cardioAbnormal = new ReportResult();
        cardioAbnormal.setParameter(cardioParam);
        cardioAbnormal.setAbnormalStatus(AbnormalStatus.HIGH);

        ReportResult metabolicNormal = new ReportResult();
        metabolicNormal.setParameter(metabolicParam);
        metabolicNormal.setAbnormalStatus(AbnormalStatus.NORMAL);

        List<ReportResult> results = Arrays.asList(cardioNormal, cardioAbnormal, metabolicNormal);

        // When
        Map<String, BigDecimal> scores = healthScoreService.generateBodySystemScores(results);

        // Then
        assertNotNull(scores);
        assertTrue(scores.containsKey("Cardiovascular"));
        assertTrue(scores.containsKey("Metabolic"));
        assertEquals(new BigDecimal("50.00"), scores.get("Cardiovascular")); // 1 normal out of 2
        assertEquals(new BigDecimal("100.00"), scores.get("Metabolic")); // 1 normal out of 1
    }

    @Test
    void generateBodySystemScores_WithNullCategory() {
        // Given
        TestParameter generalParam = new TestParameter();
        generalParam.setId(1L);
        generalParam.setParameterName("General Test");

        ReportResult generalResult = new ReportResult();
        generalResult.setParameter(generalParam);
        generalResult.setAbnormalStatus(AbnormalStatus.NORMAL);

        List<ReportResult> results = Arrays.asList(generalResult);

        // When
        Map<String, BigDecimal> scores = healthScoreService.generateBodySystemScores(results);

        // Then
        assertNotNull(scores);
        assertTrue(scores.containsKey("General"));
        assertEquals(new BigDecimal("100.00"), scores.get("General"));
    }

    @Test
    void calculateHealthScore_AllNormalResults() {
        // Given
        ReportResult result1 = new ReportResult();
        result1.setParameter(normalResult.getParameter());
        result1.setAbnormalStatus(AbnormalStatus.NORMAL);

        ReportResult result2 = new ReportResult();
        result2.setParameter(normalResult.getParameter());
        result2.setAbnormalStatus(AbnormalStatus.NORMAL);

        ReportResult result3 = new ReportResult();
        result3.setParameter(normalResult.getParameter());
        result3.setAbnormalStatus(AbnormalStatus.NORMAL);

        List<ReportResult> results = Arrays.asList(result1, result2, result3);
        when(reportResultRepository.findByBookingId(1L)).thenReturn(results);

        // When
        HealthScoreResponse response = healthScoreService.calculateHealthScore(1L);

        // Then
        assertNotNull(response);
        assertEquals(new BigDecimal("100.00"), response.getOverallScore());
        assertEquals("LOW", response.getRiskLevel());
    }

    @Test
    void calculateHealthScore_AllAbnormalResults() {
        // Given
        ReportResult result1 = new ReportResult();
        result1.setParameter(normalResult.getParameter());
        result1.setAbnormalStatus(AbnormalStatus.LOW);

        ReportResult result2 = new ReportResult();
        result2.setParameter(normalResult.getParameter());
        result2.setAbnormalStatus(AbnormalStatus.HIGH);

        List<ReportResult> results = Arrays.asList(result1, result2);
        when(reportResultRepository.findByBookingId(1L)).thenReturn(results);

        // When
        HealthScoreResponse response = healthScoreService.calculateHealthScore(1L);

        // Then
        assertNotNull(response);
        assertEquals(new BigDecimal("0.00"), response.getOverallScore());
        assertEquals("CRITICAL", response.getRiskLevel());
    }

    @Test
    void generateBodySystemScores_EmptyList() {
        // Given
        List<ReportResult> emptyResults = Arrays.asList();

        // When
        Map<String, BigDecimal> scores = healthScoreService.generateBodySystemScores(emptyResults);

        // Then
        assertNotNull(scores);
        assertTrue(scores.isEmpty());
    }

    @Test
    void calculateHealthScore_SingleResult() {
        // Given
        List<ReportResult> results = Arrays.asList(normalResult);
        when(reportResultRepository.findByBookingId(1L)).thenReturn(results);

        // When
        HealthScoreResponse response = healthScoreService.calculateHealthScore(1L);

        // Then
        assertNotNull(response);
        assertEquals(new BigDecimal("100.00"), response.getOverallScore()); // 1 normal out of 1
        assertEquals("LOW", response.getRiskLevel());
    }

    @Test
    void determineRiskLevel_EdgeCases() {
        // Test edge cases around boundaries
        assertEquals(RiskLevel.MODERATE, healthScoreService.determineRiskLevel(new BigDecimal("89.99")));
        assertEquals(RiskLevel.HIGH, healthScoreService.determineRiskLevel(new BigDecimal("69.99")));
        assertEquals(RiskLevel.CRITICAL, healthScoreService.determineRiskLevel(new BigDecimal("49.99")));
    }

    @Test
    void calculateHealthScore_VeryLargeNumberOfResults() {
        // Given - Create many results to test rounding
        ReportResult[] resultsArray = new ReportResult[100];
        for (int i = 0; i < 100; i++) {
            ReportResult result = new ReportResult();
            result.setParameter(normalResult.getParameter());
            result.setAbnormalStatus(i < 85 ? AbnormalStatus.NORMAL : AbnormalStatus.HIGH); // 85% normal
            resultsArray[i] = result;
        }
        List<ReportResult> results = Arrays.asList(resultsArray);
        when(reportResultRepository.findByBookingId(1L)).thenReturn(results);

        // When
        HealthScoreResponse response = healthScoreService.calculateHealthScore(1L);

        // Then
        assertNotNull(response);
        assertEquals(new BigDecimal("85.00"), response.getOverallScore()); // 85% normal
        assertEquals("MODERATE", response.getRiskLevel()); // 85% falls in MODERATE range (70-89.99)
    }

    @Test
    void generateBodySystemScores_MixedCategories() {
        // Given
        TestParameter param1 = new TestParameter();
        param1.setParameterName("Test 1");

        TestParameter param2 = new TestParameter();
        param2.setParameterName("Test 2");

        TestParameter param3 = new TestParameter();
        param3.setParameterName("Test 3");

        ReportResult result1 = new ReportResult();
        result1.setParameter(param1);
        result1.setAbnormalStatus(AbnormalStatus.NORMAL);

        ReportResult result2 = new ReportResult();
        result2.setParameter(param2);
        result2.setAbnormalStatus(AbnormalStatus.HIGH); // Abnormal

        ReportResult result3 = new ReportResult();
        result3.setParameter(param3);
        result3.setAbnormalStatus(AbnormalStatus.NORMAL);

        List<ReportResult> results = Arrays.asList(result1, result2, result3);

        // When
        Map<String, BigDecimal> scores = healthScoreService.generateBodySystemScores(results);

        // Then
        assertEquals(2, scores.size());
        assertEquals(new BigDecimal("100.00"), scores.get("Cardiovascular")); // 2 normal out of 2
        assertEquals(new BigDecimal("0.00"), scores.get("Metabolic")); // 0 normal out of 1
    }
}
