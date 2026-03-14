package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {
    @NotBlank(message = "to is required")
    @Size(max = 250, message = "to must be at most 250 characters")
    private String to;

    @NotBlank(message = "subject is required")
    @Size(max = 250, message = "subject must be at most 250 characters")
    private String subject;

    @NotBlank(message = "body is required")
    @Size(max = 250, message = "body must be at most 250 characters")
    private String body;
    private Map<String, Object> templateData;
}
