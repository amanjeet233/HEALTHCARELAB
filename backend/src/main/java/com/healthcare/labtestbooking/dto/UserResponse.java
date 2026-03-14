package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @Size(max = 50, message = "Role must be at most 50 characters")
    private String role;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
    private String phone;

    @Size(max = 500, message = "Address must be at most 500 characters")
    private String address;
}
