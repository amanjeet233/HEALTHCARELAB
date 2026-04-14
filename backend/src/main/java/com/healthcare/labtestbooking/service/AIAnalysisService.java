package com.healthcare.labtestbooking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.labtestbooking.dto.AiAnalysisFlagDto;
import com.healthcare.labtestbooking.dto.AiAnalysisRecommendationDto;
import com.healthcare.labtestbooking.dto.AiAnalysisResponseDto;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.ReportAiAnalysis;
import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.AiAnalysisStatus;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.exception.ResourceNotFoundException;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.ReportAiAnalysisRepository;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIAnalysisService {

    private static final String OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

    private final BookingRepository bookingRepository;
    private final ReportResultRepository reportResultRepository;
    private final ReportAiAnalysisRepository reportAiAnalysisRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.ai.enabled:true}")
    private boolean aiEnabled;

    @Value("${app.ai.openai.api-key:}")
    private String openAiApiKey;

    @Value("${app.ai.openai.model:gpt-4o-mini}")
    private String openAiModel;

    @Transactional
    public void requestAnalysisForBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        upsertPendingRecord(booking);
        analyzeReport(bookingId);
    }

    @Async
    @Transactional
    public void analyzeReport(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        ReportAiAnalysis analysis = upsertPendingRecord(booking);

        List<ReportResult> results = reportResultRepository.findByBookingId(bookingId);
        if (results.isEmpty()) {
            analysis.setStatus(AiAnalysisStatus.FAILED);
            analysis.setErrorMessage("No test results found for booking");
            reportAiAnalysisRepository.save(analysis);
            return;
        }

        String promptSnapshot = buildPrompt(booking, results);
        analysis.setPromptSnapshot(promptSnapshot);
        reportAiAnalysisRepository.save(analysis);

        if (!aiEnabled || openAiApiKey == null || openAiApiKey.isBlank()) {
            analysis.setStatus(AiAnalysisStatus.FAILED);
            analysis.setErrorMessage("AI analysis is disabled or API key is missing");
            reportAiAnalysisRepository.save(analysis);
            return;
        }

        try {
            String rawResponse = callOpenAi(promptSnapshot);
            analysis.setRawResponse(rawResponse);

            JsonNode parsedContent = extractAndParseContent(rawResponse);
            applyParsedAnalysis(analysis, parsedContent);

            analysis.setStatus(AiAnalysisStatus.COMPLETED);
            analysis.setGeneratedAt(LocalDateTime.now());
            analysis.setErrorMessage(null);
            reportAiAnalysisRepository.save(analysis);
        } catch (Exception ex) {
            log.error("Failed to generate AI analysis for booking {}", bookingId, ex);
            analysis.setStatus(AiAnalysisStatus.FAILED);
            analysis.setErrorMessage(ex.getMessage());
            reportAiAnalysisRepository.save(analysis);
        }
    }

    @Transactional(readOnly = true)
    public AiAnalysisResponseDto getAnalysisForBooking(Long bookingId) {
        User currentUser = getCurrentUser();

        ReportAiAnalysis analysis = reportAiAnalysisRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("AI analysis not yet generated"));

        enforceAccess(currentUser, analysis.getBooking());

        if (analysis.getStatus() != AiAnalysisStatus.COMPLETED) {
            throw new ResourceNotFoundException("AI analysis not yet generated");
        }

        return toDto(analysis);
    }

    @Transactional
    public void regenerateAnalysis(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        upsertPendingRecord(booking);
        analyzeReport(bookingId);
    }

    private ReportAiAnalysis upsertPendingRecord(Booking booking) {
        ReportAiAnalysis analysis = reportAiAnalysisRepository.findByBookingId(booking.getId())
                .orElseGet(() -> ReportAiAnalysis.builder().booking(booking).build());

        analysis.setStatus(AiAnalysisStatus.PENDING);
        analysis.setErrorMessage(null);
        return reportAiAnalysisRepository.save(analysis);
    }

    private void enforceAccess(User currentUser, Booking booking) {
        if (currentUser.getRole() == UserRole.PATIENT) {
            Long bookingPatientId = booking != null && booking.getPatient() != null ? booking.getPatient().getId() : null;
            if (bookingPatientId == null || !bookingPatientId.equals(currentUser.getId())) {
                throw new ResourceNotFoundException("AI analysis not found");
            }
        }
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new ResourceNotFoundException("Unauthorized");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String callOpenAi(String prompt) throws JsonProcessingException {
        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", openAiModel);
        requestBody.put("temperature", 0.2);
        requestBody.put("response_format", Map.of("type", "json_object"));
        requestBody.put("messages", List.of(
                Map.of(
                        "role", "system",
                        "content", """
                                You are a clinical pathologist assistant.
                                Return strictly valid JSON with keys:
                                summary (string),
                                flags (array of objects with testName, value, severity, clinicalNote),
                                patterns (array of strings),
                                recommendations (array of objects with category and text),
                                disclaimer (string).
                                Severity must be one of: NORMAL, MILD, MODERATE, CRITICAL.
                                Keep language patient-friendly and concise.
                                """
                ),
                Map.of("role", "user", "content", prompt)
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(OPENAI_CHAT_COMPLETIONS_URL, entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IllegalStateException("OpenAI call failed with status: " + response.getStatusCode());
        }
        return response.getBody();
    }

    private JsonNode extractAndParseContent(String rawResponse) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(rawResponse);
        JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
        if (contentNode.isMissingNode() || contentNode.isNull()) {
            throw new IllegalStateException("OpenAI response missing content");
        }

        String jsonText = contentNode.isTextual() ? contentNode.asText() : contentNode.toString();
        return objectMapper.readTree(jsonText);
    }

    private void applyParsedAnalysis(ReportAiAnalysis analysis, JsonNode parsed) throws JsonProcessingException {
        analysis.setSummary(readText(parsed, "summary"));
        analysis.setDisclaimer(readText(parsed, "disclaimer"));

        JsonNode flagsNode = parsed.path("flags");
        JsonNode patternsNode = parsed.path("patterns");
        JsonNode recommendationsNode = parsed.path("recommendations");

        analysis.setFlagsJson(toJsonArrayOrEmpty(flagsNode));
        analysis.setPatternsJson(toJsonArrayOrEmpty(patternsNode));
        analysis.setRecommendationsJson(toJsonArrayOrEmpty(recommendationsNode));
        analysis.setHealthScore(calculateHealthScore(flagsNode));
    }

    private String buildPrompt(Booking booking, List<ReportResult> results) {
        User patient = booking.getPatient();
        String patientGender = patient != null && patient.getGender() != null ? patient.getGender().name() : "UNKNOWN";
        Integer age = resolveAge(patient);
        String testName = booking.getTest() != null ? booking.getTest().getTestName() : "Lab Test";

        StringBuilder sb = new StringBuilder();
        sb.append("Patient context:\n");
        sb.append("- age: ").append(age != null ? age : "UNKNOWN").append("\n");
        sb.append("- gender: ").append(patientGender).append("\n");
        sb.append("- bookingId: ").append(booking.getId()).append("\n");
        sb.append("- testName: ").append(testName).append("\n\n");
        sb.append("Results:\n");

        for (ReportResult result : results) {
            String parameterName = result.getParameter() != null ? result.getParameter().getParameterName() : "Unknown Parameter";
            String value = result.getResultValue() != null && !result.getResultValue().isBlank()
                    ? result.getResultValue()
                    : Optional.ofNullable(result.getValue()).orElse("-");
            String unit = result.getUnit() != null ? result.getUnit() : Optional.ofNullable(result.getParameter())
                    .map(p -> p.getUnit())
                    .orElse("-");
            String referenceRange = resolveReferenceRange(result);
            String outOfRange = (Boolean.TRUE.equals(result.getIsAbnormal()) || Boolean.TRUE.equals(result.getIsCritical())) ? "YES" : "NO";

            sb.append("- testName: ").append(parameterName)
                    .append(", value: ").append(value)
                    .append(", unit: ").append(unit)
                    .append(", referenceRange: ").append(referenceRange)
                    .append(", flaggedOutsideRange: ").append(outOfRange)
                    .append("\n");
        }

        sb.append("\nGenerate plain-language insights for the patient based only on the above data.");
        return sb.toString();
    }

    private Integer resolveAge(User patient) {
        if (patient == null || patient.getDateOfBirth() == null) {
            return null;
        }
        return Period.between(patient.getDateOfBirth(), LocalDate.now()).getYears();
    }

    private String resolveReferenceRange(ReportResult result) {
        if (result.getNormalRange() != null && !result.getNormalRange().isBlank()) {
            return result.getNormalRange();
        }
        if (result.getParameter() != null
                && result.getParameter().getNormalRangeMin() != null
                && result.getParameter().getNormalRangeMax() != null) {
            return result.getParameter().getNormalRangeMin() + " - " + result.getParameter().getNormalRangeMax();
        }
        if (result.getNormalRangeMin() != null && result.getNormalRangeMax() != null) {
            return result.getNormalRangeMin() + " - " + result.getNormalRangeMax();
        }
        return "-";
    }

    private String readText(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isTextual() ? value.asText() : "";
    }

    private String toJsonArrayOrEmpty(JsonNode node) throws JsonProcessingException {
        if (node == null || !node.isArray()) {
            return "[]";
        }
        return objectMapper.writeValueAsString(node);
    }

    private int calculateHealthScore(JsonNode flagsNode) {
        if (flagsNode == null || !flagsNode.isArray() || flagsNode.isEmpty()) {
            return 90;
        }

        int score = 100;
        for (JsonNode flag : flagsNode) {
            String severity = flag.path("severity").asText("NORMAL");
            switch (severity.toUpperCase()) {
                case "CRITICAL" -> score -= 35;
                case "MODERATE" -> score -= 20;
                case "MILD" -> score -= 10;
                default -> {
                }
            }
        }
        return Math.max(0, score);
    }

    private AiAnalysisResponseDto toDto(ReportAiAnalysis analysis) {
        List<AiAnalysisFlagDto> flags = parseFlags(analysis.getFlagsJson());
        List<String> patterns = parsePatterns(analysis.getPatternsJson());
        List<AiAnalysisRecommendationDto> recommendations = parseRecommendations(analysis.getRecommendationsJson());
        
        List<ReportResult> results = reportResultRepository.findByBookingId(analysis.getBooking().getId());
        Map<String, Integer> organScores = calculateOrganScores(results);
        boolean hasCritical = results.stream().anyMatch(r -> Boolean.TRUE.equals(r.getIsCritical()));

        return AiAnalysisResponseDto.builder()
                .bookingId(analysis.getBooking().getId())
                .status(analysis.getStatus())
                .healthScore(analysis.getHealthScore())
                .summary(analysis.getSummary())
                .flags(flags)
                .patterns(patterns)
                .recommendations(recommendations)
                .organScores(organScores)
                .hasCriticalResults(hasCritical)
                .disclaimer(analysis.getDisclaimer())
                .generatedAt(analysis.getGeneratedAt())
                .build();
    }

    private Map<String, Integer> calculateOrganScores(List<ReportResult> results) {
        Map<String, List<ReportResult>> groups = new java.util.HashMap<>();
        for (ReportResult res : results) {
            String cat = res.getParameter() != null && res.getParameter().getCategory() != null ? res.getParameter().getCategory() : "General";
            groups.computeIfAbsent(cat, k -> new ArrayList<>()).add(res);
        }

        Map<String, Integer> scores = new java.util.HashMap<>();
        groups.forEach((cat, resList) -> {
            int base = 100;
            for (ReportResult r : resList) {
                if (Boolean.TRUE.equals(r.getIsCritical())) base -= 40;
                else if (Boolean.TRUE.equals(r.getIsAbnormal())) base -= 15;
            }
            scores.put(cat, Math.max(0, base));
        });
        return scores;
    }

    private List<AiAnalysisFlagDto> parseFlags(String flagsJson) {
        if (flagsJson == null || flagsJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(flagsJson, new TypeReference<List<AiAnalysisFlagDto>>() {
            });
        } catch (Exception ex) {
            log.warn("Failed to parse AI flags json", ex);
            return new ArrayList<>();
        }
    }

    private List<String> parsePatterns(String patternsJson) {
        if (patternsJson == null || patternsJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(patternsJson, new TypeReference<List<String>>() {
            });
        } catch (Exception ex) {
            log.warn("Failed to parse AI patterns json", ex);
            return new ArrayList<>();
        }
    }

    private List<AiAnalysisRecommendationDto> parseRecommendations(String recommendationsJson) {
        if (recommendationsJson == null || recommendationsJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(recommendationsJson, new TypeReference<List<AiAnalysisRecommendationDto>>() {
            });
        } catch (Exception ex) {
            log.warn("Failed to parse AI recommendations json", ex);
            return new ArrayList<>();
        }
    }
}
