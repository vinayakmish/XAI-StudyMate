package com.xaistudymate.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xaistudymate.backend.dto.student.StudentInputDTO;
import com.xaistudymate.backend.entity.PredictionHistory;
import com.xaistudymate.backend.entity.User;
import com.xaistudymate.backend.repository.PredictionHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Orchestrates prediction/explanation requests:
 * calls the AI service, persists results, and returns them.
 */
@Service
public class PredictionService {

    private static final Logger log = LoggerFactory.getLogger(PredictionService.class);

    private final AIServiceClient aiClient;
    private final PredictionHistoryRepository historyRepository;
    private final ObjectMapper objectMapper;

    public PredictionService(AIServiceClient aiClient,
                             PredictionHistoryRepository historyRepository,
                             ObjectMapper objectMapper) {
        this.aiClient = aiClient;
        this.historyRepository = historyRepository;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> predict(User user, StudentInputDTO input) {
        // Quick predict — no DB save. Only Explain & Study Plan persist history.
        return aiClient.predict(input);
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> explain(User user, StudentInputDTO input) {
        Map<String, Object> result = aiClient.explain(input);
        PredictionHistory history = buildBaseHistory(user, input);
        history.setType("EXPLAIN");
        history.setPlaced(Boolean.TRUE.equals(result.get("placed")));
        history.setPlacementProbability(toDouble(result.get("placement_probability")));
        history.setPredictedPackage(toDouble(result.get("predicted_package")));
        history.setRiskLevel((String) result.get("risk_level"));
        history.setExplanationsJson(toJson(result.get("explanations")));
        history.setTopStrengthsJson(toJson(result.get("top_strengths")));
        history.setTopWeaknessesJson(toJson(result.get("top_weaknesses")));
        historyRepository.save(history);
        return result;
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> studyPlan(User user, StudentInputDTO input) {
        Map<String, Object> result = aiClient.studyPlan(input);
        PredictionHistory history = buildBaseHistory(user, input);
        history.setType("STUDY_PLAN");
        history.setPlacementProbability(toDouble(result.get("placement_probability")));
        history.setPredictedPackage(toDouble(result.get("predicted_package")));
        history.setRiskLevel((String) result.get("risk_level"));
        history.setStudyPlanJson(toJson(result.get("plan_items")));
        historyRepository.save(history);
        return result;
    }

    public Page<PredictionHistory> getHistory(Long userId, Pageable pageable) {
        return historyRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public List<PredictionHistory> getRecentHistory(Long userId) {
        return historyRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<PredictionHistory> getLatest(Long userId) {
        return historyRepository.findTopByUserIdOrderByCreatedAtDesc(userId);
    }

    public long countByUser(Long userId) {
        return historyRepository.countByUserId(userId);
    }

    // ── Private helpers ────────────────────────────────────────────

    private void savePrediction(User user, StudentInputDTO input,
                                Map<String, Object> result, String type) {
        PredictionHistory history = buildBaseHistory(user, input);
        history.setType(type);
        history.setPlaced(Boolean.TRUE.equals(result.get("placed")));
        history.setPlacementProbability(toDouble(result.get("placement_probability")));
        history.setPredictedPackage(toDouble(result.get("predicted_package")));
        history.setRiskLevel((String) result.get("risk_level"));
        history.setConfidence(toDouble(result.get("confidence")));
        historyRepository.save(history);
    }

    private PredictionHistory buildBaseHistory(User user, StudentInputDTO input) {
        return PredictionHistory.builder()
                .user(user)
                .gender(input.getGender())
                .age(input.getAge())
                .degree(input.getDegree())
                .branch(input.getBranch())
                .cgpa(input.getCgpa())
                .backlogs(input.getBacklogs())
                .internships(input.getInternships())
                .certifications(input.getCertifications())
                .codingSkills(input.getCodingSkills())
                .communicationSkills(input.getCommunicationSkills())
                .aptitudeScore(input.getAptitudeScore())
                .projects(input.getProjects())
                .build();
    }

    private String toJson(Object value) {
        if (value == null) return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize to JSON: {}", e.getMessage());
            return null;
        }
    }

    private double toDouble(Object value) {
        if (value instanceof Number n) return n.doubleValue();
        if (value instanceof String s) return Double.parseDouble(s);
        return 0.0;
    }
}
