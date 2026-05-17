package com.xaistudymate.backend.dto.prediction;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Single feature explanation from SHAP analysis.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeatureExplanationDTO {
    private String feature;
    private String displayName;
    private double shapValue;
    private String currentValue;
    private String impact;          // "positive" / "negative"
    private int importanceRank;
}
