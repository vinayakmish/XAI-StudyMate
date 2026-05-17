package com.xaistudymate.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xaistudymate.backend.dto.student.StudentInputDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * HTTP client that forwards requests to the Python AI microservice (FastAPI on port 5000).
 * Translates between Spring Boot DTOs and the AI service's JSON contract.
 */
@Service
public class AIServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AIServiceClient.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ai-service.base-url}")
    private String baseUrl;

    public AIServiceClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    // ── Predict ────────────────────────────────────────────────────

    public Map<String, Object> predict(StudentInputDTO input) {
        return postToAI("/predict", toSnakeCaseMap(input));
    }

    // ── Explain ────────────────────────────────────────────────────

    public Map<String, Object> explain(StudentInputDTO input) {
        return postToAI("/explain", toSnakeCaseMap(input));
    }

    // ── Study Plan ─────────────────────────────────────────────────

    public Map<String, Object> studyPlan(StudentInputDTO input) {
        return postToAI("/study-plan", toSnakeCaseMap(input));
    }

    // ── Chat ───────────────────────────────────────────────────────

    public Map<String, Object> chat(String message, StudentInputDTO studentContext) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", message);
        if (studentContext != null) {
            body.put("student_context", toSnakeCaseMap(studentContext));
        }
        return postToAI("/chat", body);
    }

    // ── Model Info ─────────────────────────────────────────────────

    public Map<String, Object> getModelInfo() {
        String url = baseUrl + "/model-info";
        log.debug("GET {}", url);
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return parseJson(response.getBody());
    }

    // ── Health ─────────────────────────────────────────────────────

    public boolean isHealthy() {
        try {
            String url = baseUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("AI service health check failed: {}", e.getMessage());
            return false;
        }
    }

    // ── Internal helpers ───────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> postToAI(String path, Map<String, Object> body) {
        String url = baseUrl + path;
        log.debug("POST {} with body keys: {}", url, body.keySet());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            String jsonBody = objectMapper.writeValueAsString(body);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            ResponseEntity<String> response =
                    restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            return parseJson(response.getBody());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize request body", e);
        }
    }

    /**
     * Converts a StudentInputDTO to a snake_case map matching the AI service's Python schema.
     */
    private Map<String, Object> toSnakeCaseMap(StudentInputDTO input) {
        Map<String, Object> map = new HashMap<>();
        map.put("gender", input.getGender());
        map.put("age", input.getAge());
        map.put("degree", input.getDegree());
        map.put("branch", input.getBranch());
        map.put("cgpa", input.getCgpa());
        map.put("backlogs", input.getBacklogs());
        map.put("internships", input.getInternships());
        map.put("certifications", input.getCertifications());
        map.put("coding_skills", input.getCodingSkills());
        map.put("communication_skills", input.getCommunicationSkills());
        map.put("aptitude_score", input.getAptitudeScore());
        map.put("projects", input.getProjects());
        return map;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJson(String json) {
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse AI service response", e);
        }
    }
}
