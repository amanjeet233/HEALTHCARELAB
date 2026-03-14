package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.*;
import com.healthcare.labtestbooking.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "User registration, login, and password management")
public class AuthController {

        private final AuthService authService;

        @PostMapping("/register")
        @Operation(summary = "Register a new user", description = "Create a new user account with email and password")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = com.healthcare.labtestbooking.dto.ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or email already exists"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
                log.info("Register request for email: {}", request.getEmail());
                AuthResponse response = authService.register(request);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("User registered successfully", response));
        }

        @PostMapping("/login")
        @Operation(summary = "User login", description = "Authenticate user with email and password, returns JWT token")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid email or password"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
                log.info("Login request for email: {}", request.getEmail());
                AuthResponse response = authService.login(request);
                return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        }

        @PostMapping("/forgot-password")
        @Operation(summary = "Forgot password", description = "Send password reset link to user email")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password reset link sent"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User email not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestParam String email) {
                log.info("Forgot password request for email: {}", email);
                authService.forgotPassword(email);
                return ResponseEntity.ok(ApiResponse.success("Password reset link sent to email",
                                "Check your email for reset instructions"));
        }

        @PostMapping("/reset-password")
        @Operation(summary = "Reset password", description = "Reset user password with reset token")
        @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password reset successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired token"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
                log.info("Reset password request with token");
                authService.resetPassword(request);
                return ResponseEntity.ok(ApiResponse.success("Password reset successfully",
                                "You can now login with your new password"));
        }
}
