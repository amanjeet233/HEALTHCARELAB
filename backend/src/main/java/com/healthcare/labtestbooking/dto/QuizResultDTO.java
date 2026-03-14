package com.healthcare.labtestbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResultDTO {

    private Long id;
    private String quizType;
    private Object answers;
    private Integer score;
    private List<String> recommendations;
    private LocalDateTime createdAt;
}
