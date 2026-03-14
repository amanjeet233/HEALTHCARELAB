package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.AuthResponse;
import com.healthcare.labtestbooking.dto.LoginRequest;
import com.healthcare.labtestbooking.dto.RegisterRequest;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.repository.UserRepository;
import com.healthcare.labtestbooking.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
            .email("test@example.com")
            .password("password123")
            .name("Test User")
            .phone("1234567890")
            .build();

        loginRequest = LoginRequest.builder()
            .email("test@example.com")
            .password("password123")
            .build();

        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");
        user.setName("Test User");
        user.setPhone("1234567890");
        user.setRole(UserRole.PATIENT);
        user.setIsActive(true);
    }

    @Test
    void register_Success() {
        // Given
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(registerRequest.getPhone())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtil.generateToken(any(UserDetails.class))).thenReturn("accessToken");
        when(jwtUtil.generateToken(anyMap(), anyString())).thenReturn("refreshToken");

        // When
        AuthResponse response = authService.register(registerRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo(registerRequest.getEmail());
        assertThat(response.getName()).isEqualTo(registerRequest.getName());
        assertThat(response.getRole()).isEqualTo(UserRole.PATIENT.name());
        
        verify(userRepository, times(1)).save(any(User.class));
        verify(userRepository, times(1)).existsByEmail(registerRequest.getEmail());
        verify(userRepository, times(1)).existsByPhone(registerRequest.getPhone());
        verify(passwordEncoder, times(1)).encode(registerRequest.getPassword());
    }

    @Test
    void register_WithNullOptionalFields_Success() {
        // Given
        RegisterRequest request = RegisterRequest.builder()
            .email("test@example.com")
            .password("password123")
            .name("Test User")
            .build();
        // phone is null - should be optional

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setEmail(request.getEmail());
        savedUser.setName(request.getName());
        savedUser.setRole(UserRole.PATIENT);

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtUtil.generateToken(any(UserDetails.class))).thenReturn("accessToken");
        when(jwtUtil.generateToken(anyMap(), anyString())).thenReturn("refreshToken");

        // When
        AuthResponse response = authService.register(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo(request.getEmail());
        assertThat(response.getName()).isEqualTo(request.getName());
        assertThat(response.getRole()).isEqualTo(UserRole.PATIENT.name());
        
        verify(userRepository, times(1)).save(any(User.class));
        verify(userRepository, times(1)).existsByEmail(request.getEmail());
        verify(userRepository, never()).existsByPhone(anyString());
    }

    @Test
    void register_UserAlreadyExists_ThrowsException() {
        // Given
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        // When/Then
        assertThrows(RuntimeException.class, () -> {
            authService.register(registerRequest);
        });
        
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(any(UserDetails.class))).thenReturn("accessToken");
        when(jwtUtil.generateToken(anyMap(), anyString())).thenReturn("refreshToken");

        // When
        AuthResponse response = authService.login(loginRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo(user.getEmail());
        assertThat(response.getName()).isEqualTo(user.getName());
        
        verify(userRepository, times(1)).findByEmail(loginRequest.getEmail());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_InvalidCredentials_ThrowsException() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new RuntimeException("Invalid credentials"));

        // When/Then
        assertThrows(RuntimeException.class, () -> {
            authService.login(loginRequest);
        });
    }

    @Test
    void login_UserNotFound_ThrowsException() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        // When/Then
        assertThrows(RuntimeException.class, () -> {
            authService.login(loginRequest);
        });
    }
}
