package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.QuizResult;
import com.healthcare.labtestbooking.service.QuizResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz-results")
@RequiredArgsConstructor
@Tag(name = "Quiz Results", description = "Management of health quiz responses")
public class QuizResultController {

    private final QuizResultService quizResultService;

    @GetMapping
    @Operation(summary = "Get all quiz results")
    public ResponseEntity<ApiResponse<List<QuizResult>>> getAllQuizResults() {
        return ResponseEntity
                .ok(ApiResponse.success("Quiz results fetched successfully", quizResultService.getAllQuizResults()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get quiz result by ID")
    public ResponseEntity<ApiResponse<QuizResult>> getQuizResultById(@PathVariable Long id) {
        return quizResultService.getQuizResultById(id)
                .map(r -> ResponseEntity.ok(ApiResponse.success("Quiz result found", r)))
                .orElse(ResponseEntity.notFound().build());
    }
}
