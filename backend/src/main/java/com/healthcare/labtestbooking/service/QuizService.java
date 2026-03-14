package com.healthcare.labtestbooking.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.dto.QuizResultDTO;
import com.healthcare.labtestbooking.dto.QuizSubmitRequest;
import com.healthcare.labtestbooking.entity.QuizResult;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.repository.QuizResultRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {

    private final QuizResultRepository quizResultRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public QuizResultDTO submitQuiz(QuizSubmitRequest request) {
        User user = getCurrentUser();
        log.info("Quiz submitted by user: {} (type: {})", user.getId(), request.getQuizType());

        String answersJson;
        try {
            answersJson = objectMapper.writeValueAsString(request.getAnswers());
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize quiz answers", e);
        }

        int score = calculateScore(request.getAnswers());
        List<String> recommendations = generateRecommendations(request.getAnswers(), score);

        String recommendationsJson;
        try {
            recommendationsJson = objectMapper.writeValueAsString(recommendations);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize recommendations", e);
        }

        QuizResult result = QuizResult.builder()
                .user(user)
                .quizType(request.getQuizType() != null ? request.getQuizType() : "HEALTH_ASSESSMENT")
                .answersJson(answersJson)
                .score(score)
                .recommendationsJson(recommendationsJson)
                .build();

        QuizResult saved = quizResultRepository.save(result);
        return mapToDTO(saved);
    }

    public List<QuizResultDTO> getHistory() {
        User user = getCurrentUser();
        return quizResultRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public QuizResultDTO getLatestResult() {
        User user = getCurrentUser();
        return quizResultRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId())
                .map(this::mapToDTO)
                .orElse(null);
    }

    public List<String> getRecommendations() {
        User user = getCurrentUser();
        return quizResultRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId())
                .map(result -> parseRecommendations(result.getRecommendationsJson()))
                .orElse(List.of("Take the health assessment quiz to get personalized recommendations."));
    }

    // --- Score calculation (basic rule-based engine) ---

    private int calculateScore(Object answers) {
        try {
            Map<String, Object> answerMap = objectMapper.convertValue(answers, new TypeReference<>() {
            });
            int total = answerMap.size();
            if (total == 0)
                return 50;

            int positiveCount = 0;
            for (Object value : answerMap.values()) {
                String val = String.valueOf(value).toLowerCase();
                if (val.equals("yes") || val.equals("true") || val.equals("good") || val.equals("daily")
                        || val.equals("regularly")) {
                    positiveCount++;
                }
            }
            return Math.min(100, (int) ((positiveCount / (double) total) * 100));
        } catch (Exception e) {
            log.warn("Score calculation fallback due to: {}", e.getMessage());
            return 50;
        }
    }

    private List<String> generateRecommendations(Object answers, int score) {
        List<String> recommendations = new ArrayList<>();

        if (score >= 80) {
            recommendations.add("Your health indicators look great! Continue maintaining your healthy lifestyle.");
            recommendations.add("Schedule a routine annual check-up to stay on track.");
        } else if (score >= 50) {
            recommendations.add("Consider a Complete Blood Count (CBC) for a baseline health assessment.");
            recommendations.add("A Lipid Profile test can help monitor your cardiovascular health.");
            recommendations.add("Book a HbA1c test if you haven't checked your blood sugar levels recently.");
        } else {
            recommendations.add("We recommend a Full Body Health Checkup package for comprehensive assessment.");
            recommendations.add("Schedule a consultation with a medical officer to review your results.");
            recommendations.add("A Thyroid Function Test (TFT) is recommended based on your responses.");
            recommendations.add("Consider a Liver Function Test (LFT) for early detection.");
        }

        return recommendations;
    }

    // --- Helpers ---

    private QuizResultDTO mapToDTO(QuizResult result) {
        Object parsedAnswers;
        try {
            parsedAnswers = objectMapper.readValue(result.getAnswersJson(), Object.class);
        } catch (Exception e) {
            parsedAnswers = result.getAnswersJson();
        }

        List<String> recommendations = parseRecommendations(result.getRecommendationsJson());

        return QuizResultDTO.builder()
                .id(result.getId())
                .quizType(result.getQuizType())
                .answers(parsedAnswers)
                .score(result.getScore())
                .recommendations(recommendations)
                .createdAt(result.getCreatedAt())
                .build();
    }

    private List<String> parseRecommendations(String json) {
        if (json == null || json.isBlank())
            return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception e) {
            return List.of(json);
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
