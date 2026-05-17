package com.xaistudymate.backend.controller;

import com.xaistudymate.backend.dto.dashboard.DashboardDTO;
import com.xaistudymate.backend.entity.PredictionHistory;
import com.xaistudymate.backend.entity.User;
import com.xaistudymate.backend.service.AuthService;
import com.xaistudymate.backend.service.PredictionService;
import com.xaistudymate.backend.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final AuthService authService;
    private final StudentService studentService;
    private final PredictionService predictionService;

    public DashboardController(AuthService authService,
                               StudentService studentService,
                               PredictionService predictionService) {
        this.authService = authService;
        this.studentService = studentService;
        this.predictionService = predictionService;
    }

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        Long userId = user.getId();

        List<PredictionHistory> recent = predictionService.getRecentHistory(userId);
        Optional<PredictionHistory> latest = predictionService.getLatest(userId);

        // Build recent predictions summary
        List<Map<String, Object>> recentSummary = recent.stream()
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", p.getId());
                    m.put("type", p.getType());
                    m.put("placed", p.isPlaced());
                    m.put("probability", p.getPlacementProbability());
                    m.put("predictedPackage", p.getPredictedPackage());
                    m.put("riskLevel", p.getRiskLevel());
                    m.put("createdAt", p.getCreatedAt().toString());
                    return m;
                })
                .collect(Collectors.toList());

        // Build probability trend (for charts)
        List<Map<String, Object>> trend = recent.stream()
                .sorted(Comparator.comparing(PredictionHistory::getCreatedAt))
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("date", p.getCreatedAt().toLocalDate().toString());
                    m.put("probability", p.getPlacementProbability());
                    m.put("package", p.getPredictedPackage());
                    return m;
                })
                .collect(Collectors.toList());

        DashboardDTO dashboard = DashboardDTO.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .hasProfile(studentService.hasProfile(userId))
                .totalPredictions((int) predictionService.countByUser(userId))
                .latestProbability(latest.map(PredictionHistory::getPlacementProbability).orElse(null))
                .latestPackage(latest.map(PredictionHistory::getPredictedPackage).orElse(null))
                .latestRiskLevel(latest.map(PredictionHistory::getRiskLevel).orElse(null))
                .recentPredictions(recentSummary)
                .probabilityTrend(trend)
                .build();

        return ResponseEntity.ok(dashboard);
    }
}
