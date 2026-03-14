package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.AuthResponse;
import com.healthcare.labtestbooking.dto.LoginRequest;
import com.healthcare.labtestbooking.dto.RegisterRequest;
import com.healthcare.labtestbooking.dto.ResetPasswordRequest;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.Gender;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.exception.InvalidCredentialsException;
import com.healthcare.labtestbooking.exception.RegistrationFailedException;
import com.healthcare.labtestbooking.exception.UserAlreadyExistsException;
import com.healthcare.labtestbooking.repository.UserRepository;
import com.healthcare.labtestbooking.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthResponse register(RegisterRequest request) {
                log.info("========== REGISTER ATTEMPT ==========");
                log.info("Email: {}", request.getEmail());
                log.info("Name: {}", request.getName());
                log.info("Phone: {}", request.getPhone());
                log.info("Role: {}", request.getRole());

                try {
                        log.info("Step 1: Checking if email exists: {}", request.getEmail());
                        var existingUser = userRepository.findByEmail(request.getEmail());
                        if (existingUser.isPresent()) {
                                log.error("Email already exists: {}", request.getEmail());
                                throw new UserAlreadyExistsException("Email already registered");
                        }
                        log.info("✓ Email is available");

                        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
                                log.info("Step 2: Checking if phone exists: {}", request.getPhone());
                                var existingPhone = userRepository.findByPhone(request.getPhone());
                                if (existingPhone.isPresent()) {
                                        log.error("Phone already exists: {}", request.getPhone());
                                        throw new UserAlreadyExistsException("Phone number already registered");
                                }
                                log.info("✓ Phone is available");
                        }

                        log.info("Step 3: Creating user object");
                        User user = new User();
                        user.setEmail(request.getEmail());
                        user.setPassword(passwordEncoder.encode(request.getPassword()));
                        user.setName(request.getName());
                        user.setPhone(request.getPhone());
                        user.setGender(request.getGender() != null
                                        ? Gender.valueOf(request.getGender().toUpperCase())
                                        : null);
                        user.setAddress(request.getAddress());
                        user.setDateOfBirth(request.getDateOfBirth());
                        user.setBloodGroup(request.getBloodGroup());
                        user.setRole(request.getRole() != null ? request.getRole() : UserRole.PATIENT);
                        user.setIsActive(true);
                        user.setCreatedAt(LocalDateTime.now());
                        user.setUpdatedAt(LocalDateTime.now());
                        log.info("✓ User object created");

                        log.info("Step 4: Calling userRepository.save()...");
                        User savedUser;
                        try {
                                savedUser = userRepository.save(user);
                                userRepository.flush();
                        } catch (org.springframework.dao.DataIntegrityViolationException e) {
                                log.error("Duplicate entry detected during save: {}", e.getMessage());
                                throw new UserAlreadyExistsException("Email or phone already registered");
                        }
                        log.info("✓ User saved successfully! Generated ID: {}", savedUser.getId());

                        log.info("Step 5: Generating JWT token...");
                        UserDetails tokenUser = org.springframework.security.core.userdetails.User
                                        .withUsername(savedUser.getEmail())
                                        .password(savedUser.getPassword())
                                        .authorities("ROLE_" + (savedUser.getRole() != null
                                                        ? savedUser.getRole().name()
                                                        : UserRole.PATIENT.name()))
                                        .build();
                        String token = jwtService.generateToken(tokenUser);
                        log.info("✓ Token generated");

                        AuthResponse response = AuthResponse.builder()
                                        .userId(savedUser.getId())
                                        .email(savedUser.getEmail())
                                        .name(savedUser.getName())
                                        .role(savedUser.getRole() != null ? savedUser.getRole().name()
                                                        : UserRole.PATIENT.name())
                                        .accessToken(token)
                                        .build();
                        response.setTokenType("Bearer");

                        log.info("========== REGISTER SUCCESS ==========");
                        return response;

                } catch (UserAlreadyExistsException e) {
                        log.error("Registration failed: {}", e.getMessage());
                        throw e;
                } catch (Exception e) {
                        log.error("!!!!!!!!!! REGISTER FAILED !!!!!!!!!!");
                        log.error("Error type: {}", e.getClass().getName());
                        log.error("Error message: {}", e.getMessage());
                        log.error("Stack trace:", e);
                        throw new RegistrationFailedException("Registration failed: " + e.getMessage(), e);
                }
        }

        public AuthResponse login(LoginRequest request) {
                log.info("Login attempt for email: {}", request.getEmail());

                try {
                        authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(request.getEmail(),
                                                        request.getPassword()));
                        User user = userRepository.findByEmail(request.getEmail())
                                        .orElseThrow(() -> new InvalidCredentialsException("User not found"));

                        UserDetails tokenUser = org.springframework.security.core.userdetails.User
                                        .withUsername(user.getEmail())
                                        .password(user.getPassword())
                                        .authorities("ROLE_" + (user.getRole() != null
                                                        ? user.getRole().name()
                                                        : UserRole.PATIENT.name()))
                                        .build();

                        String jwtToken = jwtService.generateToken(tokenUser);

                        log.info("Login successful for: {}", request.getEmail());

                        AuthResponse response = AuthResponse.builder()
                                        .accessToken(jwtToken)
                                        .tokenType("Bearer")
                                        .userId(user.getId())
                                        .name(user.getName())
                                        .email(user.getEmail())
                                        .role(user.getRole().name())
                                        .build();
                        return response;
                } catch (AuthenticationException e) {
                        log.error("Login failed: Invalid credentials for {}", request.getEmail());
                        throw new InvalidCredentialsException("Invalid email or password");
                }
        }

        public void forgotPassword(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

                String token = UUID.randomUUID().toString();
                user.setResetPasswordToken(token);
                user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1));
                userRepository.save(user);

                log.info("========== PASSWORD RESET TOKEN GENERATED ==========");
                log.info("User: {}", email);
                log.info("Token: {}", token);
                log.info("Expiry: {}", user.getResetPasswordTokenExpiry());
                // In a real app, send mail here
        }

        public void resetPassword(ResetPasswordRequest request) {
                User user = userRepository.findByResetPasswordToken(request.getToken())
                                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

                if (user.getResetPasswordTokenExpiry() == null
                                || user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
                        throw new RuntimeException("Reset token has expired");
                }

                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                user.setResetPasswordToken(null);
                user.setResetPasswordTokenExpiry(null);
                userRepository.save(user);

                log.info("Password successfully reset for user: {}", user.getEmail());
        }

        public boolean validateToken(String token) {
                try {
                        String tokenWithoutBearer = token.startsWith("Bearer ") ? token.substring(7) : token;
                        return jwtService.validateToken(tokenWithoutBearer);
                } catch (Exception e) {
                        return false;
                }
        }

        @Transactional
        public void changePassword(String currentPassword, String newPassword) {
                UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                                .getAuthentication().getPrincipal();
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                        throw new RuntimeException("Current password is incorrect");
                }

                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
        }
}
