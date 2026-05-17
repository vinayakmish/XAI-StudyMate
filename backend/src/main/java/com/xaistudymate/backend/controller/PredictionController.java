package com.xaistudymate.backend.controller;

import com.xaistudymate.backend.dto.student.StudentInputDTO;
import com.xaistudymate.backend.entity.PredictionHistory;
import com.xaistudymate.backend.entity.User;
import com.xaistudymate.backend.service.AIServiceClient;
import com.xaistudymate.backend.service.AuthService;
import com.xaistudymate.backend.service.PredictionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class PredictionController {

    private final PredictionService predictionService;
    private final AuthService authService;
    private final AIServiceClient aiServiceClient;

    public PredictionController(PredictionService predictionService,
                                AuthService authService,
                                AIServiceClient aiServiceClient) {
        this.predictionService = predictionService;
        this.authService = authService;
        this.aiServiceClient = aiServiceClient;
    }

    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> predict(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StudentInputDTO input) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        Map<String, Object> result = predictionService.predict(user, input);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/explain")
    public ResponseEntity<Map<String, Object>> explain(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StudentInputDTO input) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        Map<String, Object> result = predictionService.explain(user, input);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/study-plan")
    public ResponseEntity<Map<String, Object>> studyPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StudentInputDTO input) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        Map<String, Object> result = predictionService.studyPlan(user, input);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/predictions/history")
    public ResponseEntity<Page<PredictionHistory>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        Page<PredictionHistory> history = predictionService.getHistory(
                user.getId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(history);
    }

    @GetMapping("/model-info")
    public ResponseEntity<Map<String, Object>> modelInfo() {
        Map<String, Object> info = aiServiceClient.getModelInfo();
        return ResponseEntity.ok(info);
    }
}
