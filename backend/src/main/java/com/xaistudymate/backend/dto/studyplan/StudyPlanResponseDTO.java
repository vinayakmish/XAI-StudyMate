package com.xaistudymate.backend.dto.studyplan;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Full study plan response from the AI service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyPlanResponseDTO {
    private String studentSummary;
    private double placementProbability;
    private double predictedPackage;
    private String riskLevel;
    private List<StudyPlanItemDTO> planItems;
    private List<Map<String, Object>> flowNodes;
    private List<Map<String, Object>> flowEdges;
    private List<Map<String, Object>> weeklyMilestones;
}
