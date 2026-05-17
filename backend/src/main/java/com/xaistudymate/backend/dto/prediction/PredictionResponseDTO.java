package com.xaistudymate.backend.dto.prediction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Prediction result from the AI service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionResponseDTO {
    private boolean placed;
    private double placementProbability;
    private double predictedPackage;
    private String riskLevel;
    private double confidence;
}
