package com.xaistudymate.backend.controller;

import com.xaistudymate.backend.entity.PredictionHistory;
import com.xaistudymate.backend.entity.User;
import com.xaistudymate.backend.repository.PredictionHistoryRepository;
import com.xaistudymate.backend.repository.StudentProfileRepository;
import com.xaistudymate.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Admin-only endpoints: overview, at-risk students, student study plans.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PredictionHistoryRepository predictionRepository;
    private final StudentProfileRepository profileRepository;

    public AdminController(UserRepository userRepository,
                           PredictionHistoryRepository predictionRepository,
                           StudentProfileRepository profileRepository) {
        this.userRepository = userRepository;
        this.predictionRepository = predictionRepository;
        this.profileRepository = profileRepository;
    }

    /**
     * Admin overview: total students, total predictions, at-risk count,
     * and list of ALL students with latest prediction data.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> adminDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }

        List<Map<String, Object>> students = buildStudentList();

        long totalStudents = students.size();
        long totalPredictions = predictionRepository.count();
        long atRiskCount = students.stream()
                .filter(s -> s.get("lastPlacementProb") != null
                        && ((Number) s.get("lastPlacementProb")).doubleValue() < 0.5)
                .count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalStudents", totalStudents);
        result.put("totalPredictions", totalPredictions);
        result.put("atRiskCount", atRiskCount);
        result.put("students", students);

        return ResponseEntity.ok(result);
    }

    /**
     * Students with placement probability below 50%.
     */
    @GetMapping("/at-risk")
    public ResponseEntity<?> atRiskStudents(@AuthenticationPrincipal UserDetails userDetails) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }

        List<Map<String, Object>> atRisk = buildStudentList().stream()
                .filter(s -> s.get("lastPlacementProb") != null
                        && ((Number) s.get("lastPlacementProb")).doubleValue() < 0.5)
                .collect(Collectors.toList());

        return ResponseEntity.ok(atRisk);
    }

    /**
     * Get a specific student's latest study plan JSON.
     */
    @GetMapping("/students/{userId}/study-plan")
    public ResponseEntity<?> getStudentStudyPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }

        User student = userRepository.findById(userId).orElse(null);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        // Find the latest STUDY_PLAN type prediction
        List<PredictionHistory> history = predictionRepository
                .findTop10ByUserIdOrderByCreatedAtDesc(userId);

        Optional<PredictionHistory> studyPlanEntry = history.stream()
                .filter(p -> "STUDY_PLAN".equals(p.getType()))
                .findFirst();

        // Fallback to latest EXPLAIN entry
        Optional<PredictionHistory> explainEntry = history.stream()
                .filter(p -> "EXPLAIN".equals(p.getType()))
                .findFirst();

        PredictionHistory entry = studyPlanEntry.orElse(explainEntry.orElse(null));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("studentName", student.getFullName());
        result.put("studentEmail", student.getEmail());
        result.put("studentPhone", student.getPhone());
        result.put("isPlaced", student.isPlaced());

        if (entry != null) {
            result.put("studyPlanJson", entry.getStudyPlanJson());
            result.put("explanationsJson", entry.getExplanationsJson());
            result.put("topStrengthsJson", entry.getTopStrengthsJson());
            result.put("topWeaknessesJson", entry.getTopWeaknessesJson());
            result.put("placementProbability", entry.getPlacementProbability());
            result.put("predictedPackage", entry.getPredictedPackage());
            result.put("riskLevel", entry.getRiskLevel());
            result.put("placed", entry.isPlaced());
            result.put("type", entry.getType());
        } else {
            result.put("studyPlanJson", null);
            result.put("message", "No study plan or explanation found for this student.");
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Get full prediction history for a specific student.
     */
    @GetMapping("/students/{userId}/predictions")
    public ResponseEntity<?> getStudentPredictions(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }

        List<PredictionHistory> predictions = predictionRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = predictions.stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("type", p.getType());
            m.put("placed", p.isPlaced());
            m.put("placementProbability", p.getPlacementProbability());
            m.put("predictedPackage", p.getPredictedPackage());
            m.put("riskLevel", p.getRiskLevel());
            m.put("cgpa", p.getCgpa());
            m.put("codingSkills", p.getCodingSkills());
            m.put("aptitudeScore", p.getAptitudeScore());
            m.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Mark or unmark a student as placed.
     */
    @PutMapping("/students/{userId}/mark-placed")
    public ResponseEntity<?> markStudentPlaced(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId,
            @RequestBody Map<String, Boolean> body) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        User student = userRepository.findById(userId).orElse(null);
        if (student == null) return ResponseEntity.notFound().build();

        boolean placed = body.getOrDefault("placed", false);
        student.setPlaced(placed);
        userRepository.save(student);

        return ResponseEntity.ok(Map.of(
                "id", student.getId(),
                "fullName", student.getFullName(),
                "isPlaced", student.isPlaced(),
                "message", placed ? "Student marked as placed" : "Placement status removed"
        ));
    }

    // ── Helpers ────────────────────────────────────────────────────

    private boolean isAdmin(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(u -> u.getRole().name().equals("ADMIN"))
                .orElse(false);
    }

    private List<Map<String, Object>> buildStudentList() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("STUDENT"))
                .map(u -> {
                    Map<String, Object> info = new LinkedHashMap<>();
                    info.put("id", u.getId());
                    info.put("fullName", u.getFullName());
                    info.put("email", u.getEmail());
                    info.put("phone", u.getPhone());
                    info.put("isPlaced", u.isPlaced());
                    info.put("registeredAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);

                    Optional<PredictionHistory> latest = predictionRepository
                            .findTopByUserIdOrderByCreatedAtDesc(u.getId());
                    if (latest.isPresent()) {
                        PredictionHistory p = latest.get();
                        info.put("lastPredictionDate", p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
                        info.put("lastPlacementProb", p.getPlacementProbability());
                        info.put("lastRiskLevel", p.getRiskLevel());
                        info.put("lastPlaced", p.isPlaced());
                        info.put("totalPredictions", predictionRepository.countByUserId(u.getId()));
                    } else {
                        info.put("lastPredictionDate", null);
                        info.put("lastPlacementProb", null);
                        info.put("lastRiskLevel", null);
                        info.put("lastPlaced", null);
                        info.put("totalPredictions", 0);
                    }
                    return info;
                })
                .collect(Collectors.toList());
    }
}
