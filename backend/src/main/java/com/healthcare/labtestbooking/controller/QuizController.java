package com.healthcare.labtestbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.dto.QuizResultDTO;
import com.healthcare.labtestbooking.dto.QuizSubmitRequest;
import com.healthcare.labtestbooking.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('PATIENT', 'TECHNICIAN', 'MEDICAL_OFFICER', 'ADMIN')")
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
@Tag(name = "Health Quiz", description = "Health assessment quiz submission and recommendations")
@SecurityRequirement(name = "bearerAuth")
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/submit")
    @Operation(summary = "Submit quiz", description = "Submit health assessment quiz answers and get score + recommendations")
    public ResponseEntity<ApiResponse<QuizResultDTO>> submitQuiz(@Valid @RequestBody QuizSubmitRequest request) {
        QuizResultDTO result = quizService.submitQuiz(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Quiz submitted successfully", result));
    }

    @GetMapping("/history")
    @Operation(summary = "Quiz history", description = "Get all past quiz results for the authenticated user")
    public ResponseEntity<ApiResponse<List<QuizResultDTO>>> getQuizHistory() {
        List<QuizResultDTO> history = quizService.getHistory();
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/latest")
    @Operation(summary = "Latest quiz result", description = "Get the most recent quiz result")
    public ResponseEntity<ApiResponse<QuizResultDTO>> getLatestResult() {
        QuizResultDTO latest = quizService.getLatestResult();
        if (latest == null) {
            return ResponseEntity.ok(ApiResponse.success("No quiz results found", null));
        }
        return ResponseEntity.ok(ApiResponse.success(latest));
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Get recommendations", description = "Get personalized health recommendations based on latest quiz")
    public ResponseEntity<ApiResponse<List<String>>> getRecommendations() {
        List<String> recommendations = quizService.getRecommendations();
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }
}
