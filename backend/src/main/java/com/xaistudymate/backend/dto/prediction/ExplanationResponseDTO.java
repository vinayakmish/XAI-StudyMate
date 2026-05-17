package com.xaistudymate.backend.dto.prediction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Full SHAP explanation response from the AI service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExplanationResponseDTO {
    private boolean placed;
    private double placementProbability;
    private double predictedPackage;
    private String riskLevel;
    private List<FeatureExplanationDTO> explanations;
    private List<String> topStrengths;
    private List<String> topWeaknesses;
}
