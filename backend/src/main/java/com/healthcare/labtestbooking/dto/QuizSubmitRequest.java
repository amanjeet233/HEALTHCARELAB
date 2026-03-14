package com.healthcare.labtestbooking.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitRequest {

    @NotBlank(message = "quizType is required")

    @Size(max = 250, message = "quizType must be at most 250 characters")

    private String quizType;

    @NotNull(message = "Answers are required")
    private Object answers;
}
