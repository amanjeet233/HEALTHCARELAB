package com.healthcare.labtestbooking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.dto.AuthResponse;
import com.healthcare.labtestbooking.dto.RegisterRequest;
import com.healthcare.labtestbooking.security.JwtUtil;
import com.healthcare.labtestbooking.security.UserDetailsServiceImpl;
import com.healthcare.labtestbooking.service.AuthService;
import com.healthcare.labtestbooking.config.TestSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(TestSecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void register_Success() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
            .email("test@example.com")
            .password("password123")
            .name("Test User")
            .phone("1234567890")
            .gender("MALE")
            .address("Test Address")
            .bloodGroup("O+")
            .build();

        AuthResponse response = AuthResponse.builder()
            .email("test@example.com")
            .name("Test User")
            .role("PATIENT")
            .accessToken("dummy-token")
            .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }
}
