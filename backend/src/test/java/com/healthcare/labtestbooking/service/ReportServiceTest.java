package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.ReportResultDTO;
import com.healthcare.labtestbooking.dto.ReportResultRequest;
import com.healthcare.labtestbooking.entity.*;
import com.healthcare.labtestbooking.entity.enums.AbnormalStatus;
import com.healthcare.labtestbooking.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TestParameterRepository testParameterRepository;

    @Mock
    private ReportResultRepository reportResultRepository;

    @Mock
    private HealthScoreRepository healthScoreRepository;

    @Mock
    private RecommendationRepository recommendationRepository;

    @InjectMocks
    private ReportService reportService;

    private Booking booking;
    private User technician;
    private User patient;
    private TestParameter parameter;
    private ReportResult reportResult;

    @BeforeEach
    void setUp() {
        patient = new User();
        patient.setId(1L);
        patient.setName("Test Patient");

        technician = new User();
        technician.setId(2L);
        technician.setName("Test Technician");
        technician.setEmail("tech@test.com");

        booking = new Booking();
        booking.setId(1L);
        booking.setPatient(patient);
        booking.setTechnician(technician);

        parameter = new TestParameter();
        parameter.setId(1L);
        parameter.setParameterName("Glucose");
        parameter.setNormalRangeMin(new BigDecimal("70"));
        parameter.setNormalRangeMax(new BigDecimal("140"));
        parameter.setCriticalLow(new BigDecimal("50"));
        parameter.setCriticalHigh(new BigDecimal("300"));

        reportResult = new ReportResult();
        reportResult.setId(1L);
        reportResult.setBooking(booking);
        reportResult.setParameter(parameter);
        reportResult.setResultValue("100");
        reportResult.setAbnormalStatus(AbnormalStatus.NORMAL);
        reportResult.setIsAbnormal(false);
        reportResult.setIsCritical(false);
    }

    @Test
    void enterReportResults_Success() {
        // Given
        ReportResultRequest request = ReportResultRequest.builder()
                .bookingId(1L)
                .technicianId(2L)
                .results(List.of(
                        ReportResultRequest.ResultItem.builder()
                                .parameterId(1L)
                                .resultValue("100")
                                .unit("mg/dL")
                                .notes("Normal range")
                                .build()))
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(userRepository.findByEmail("tech@test.com")).thenReturn(Optional.of(technician));
        when(testParameterRepository.findById(1L)).thenReturn(Optional.of(parameter));
        when(reportResultRepository.save(any(ReportResult.class))).thenReturn(reportResult);

        // Mock SecurityContext
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);

        when(userDetails.getUsername()).thenReturn("tech@test.com");
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        try (var mockedSecurity = mockStatic(SecurityContextHolder.class)) {
            mockedSecurity.when(SecurityContextHolder::getContext).thenReturn(securityContext);

            // When
            ReportResultDTO result = reportService.enterReportResults(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getBookingId()).isEqualTo(1L);
            assertThat(result.getTechnicianId()).isEqualTo(2L);
            assertThat(result.getResults()).hasSize(1);
        }
    }

    @Test
    void enterReportResults_BookingNotFound_ThrowsException() {
        // Given
        ReportResultRequest request = ReportResultRequest.builder()
                .bookingId(999L)
                .technicianId(2L)
                .results(List.of())
                .build();

        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThrows(RuntimeException.class, () -> {
            reportService.enterReportResults(request);
        });
    }

    @Test
    void getReportByBookingId_Success() {
        // Given
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(reportResultRepository.findByBookingId(1L)).thenReturn(List.of(reportResult));

        // When
        ReportResultDTO result = reportService.getReportByBookingId(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getBookingId()).isEqualTo(1L);
        assertThat(result.getResults()).hasSize(1);
    }

    @Test
    void getReportByBookingId_NotFound_ThrowsException() {
        // Given
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        // When/Then
        assertThrows(RuntimeException.class, () -> {
            reportService.getReportByBookingId(999L);
        });
    }

    @Test
    void getReportByBookingId_NoResults_ThrowsException() {
        // Given
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(reportResultRepository.findByBookingId(1L)).thenReturn(List.of());

        // When/Then
        assertThrows(RuntimeException.class, () -> {
            reportService.getReportByBookingId(1L);
        });
    }
}