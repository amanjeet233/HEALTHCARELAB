package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.*;
import com.healthcare.labtestbooking.entity.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamilyMemberRequest {
    @NotBlank(message = "relation is required")
    @Size(max = 250, message = "relation must be at most 250 characters")
    private String relation;
    private LocalDate dateOfBirth;
    private Gender gender;
    @NotBlank(message = "bloodGroup is required")
    @Size(max = 250, message = "bloodGroup must be at most 250 characters")
    private String bloodGroup;
}
