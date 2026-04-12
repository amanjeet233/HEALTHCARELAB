package com.healthcare.labtestbooking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.dto.ReportResultRequest;
import com.healthcare.labtestbooking.dto.ReportResultDTO;
import com.healthcare.labtestbooking.security.JwtUtil;
import com.healthcare.labtestbooking.security.UserDetailsServiceImpl;
import com.healthcare.labtestbooking.service.ReportGeneratorService;
import com.healthcare.labtestbooking.service.ReportResultService;
import com.healthcare.labtestbooking.service.ReportService;
import com.healthcare.labtestbooking.service.ReportVerificationService;
import com.healthcare.labtestbooking.service.TokenBlacklistService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import com.healthcare.labtestbooking.config.TestSecurityConfig;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
@WebMvcTest(ReportController.class)
@Import(TestSecurityConfig.class)
@ExtendWith(SpringExtension.class)
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReportService reportService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private ReportGeneratorService reportGeneratorService;

    @MockBean
    private ReportResultService reportResultService;

    @MockBean
    private ReportVerificationService reportVerificationService;

    @MockBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void submitReportResults_Success() throws Exception {
        // Given - Create request
        ReportResultRequest request = ReportResultRequest.builder()
            .bookingId(1L)
            .technicianId(1L)
            .results(List.of(
                ReportResultRequest.ResultItem.builder()
                    .parameterId(1L)
                    .resultValue("5.5")
                    .unit("mg/dL")
                    .notes("Normal range")
                    .build()
            ))
            .build();

        // Mock service response
        ReportResultDTO expectedResult = new ReportResultDTO();
        when(reportService.enterReportResults(any(ReportResultRequest.class)))
            .thenReturn(expectedResult);

        // When/Then - Perform request and verify
        mockMvc.perform(post("/api/reports/results")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void submitReportResults_Forbidden_WrongRole() throws Exception {
        // Given
        ReportResultRequest request = ReportResultRequest.builder()
            .bookingId(1L)
            .technicianId(1L)
            .results(List.of(
                ReportResultRequest.ResultItem.builder()
                    .parameterId(1L)
                    .resultValue("5.5")
                    .unit("mg/dL")
                    .notes("Normal range")
                    .build()
            ))
            .build();

        // When/Then
        mockMvc.perform(post("/api/reports/results")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());  // Expect 403
    }

    @Test
    void submitReportResults_Unauthorized_NoAuthentication() throws Exception {
        // Given
        ReportResultRequest request = ReportResultRequest.builder()
            .bookingId(1L)
            .technicianId(1L)
            .results(List.of(
                ReportResultRequest.ResultItem.builder()
                    .parameterId(1L)
                    .resultValue("5.5")
                    .unit("mg/dL")
                    .notes("Normal range")
                    .build()
            ))
            .build();

        // When/Then
        mockMvc.perform(post("/api/reports/results")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());  // Expect 401
    }
}
