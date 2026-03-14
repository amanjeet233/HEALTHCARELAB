package com.healthcare.labtestbooking.dto;

import com.healthcare.labtestbooking.entity.enums.UserRole;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "name is required")
    @Size(max = 250, message = "name must be at most 250 characters")
    private String name;

    @NotBlank(message = "email is required")
    @Size(max = 250, message = "email must be at most 250 characters")
    private String email;

    @NotBlank(message = "password is required")
    @Size(max = 250, message = "password must be at most 250 characters")
    private String password;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
    @NotBlank(message = "gender is required")
    @Size(max = 250, message = "gender must be at most 250 characters")
    private String gender;

    @Min(value = 0, message = "Age cannot be negative")
    @Max(value = 120, message = "Age cannot exceed 120")
    private Integer age;

    @Size(max = 250, message = "Address must be at most 250 characters")
    @NotBlank(message = "bloodGroup is required")
    @Size(max = 250, message = "bloodGroup must be at most 250 characters")
    private String bloodGroup;

    @Builder.Default
    private UserRole role = UserRole.PATIENT;
}
