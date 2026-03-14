package com.healthcare.labtestbooking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.config.TestSecurityConfig;
import com.healthcare.labtestbooking.dto.BookingRequest;
import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.entity.enums.CollectionType;
import com.healthcare.labtestbooking.security.JwtUtil;
import com.healthcare.labtestbooking.security.UserDetailsServiceImpl;
import com.healthcare.labtestbooking.service.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BookingController.class)
@Import(TestSecurityConfig.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingService bookingService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockUser(roles = "PATIENT")
    void createBooking_Success() throws Exception {
        BookingRequest request = new BookingRequest();
        request.setTestId(1L);
        request.setPatientId(1L);
        request.setBookingDate(LocalDate.now().plusDays(1));
        request.setTimeSlot("09:00-10:00");
        request.setCollectionType(CollectionType.LAB.name());

        BookingResponse response = new BookingResponse();
        response.setId(1L);
        response.setBookingReference("BOOK123");

        when(bookingService.createBooking(any(BookingRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }
}
