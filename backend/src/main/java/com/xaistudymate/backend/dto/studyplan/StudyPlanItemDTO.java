package com.xaistudymate.backend.dto.studyplan;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Single item in a personalized study plan.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyPlanItemDTO {
    private String id;
    private String title;
    private String description;
    private String priority;       // "high" / "medium" / "low"
    private String category;
    private String currentValue;
    private String targetValue;
    private double estimatedImpact;
    private int timelineWeek;
    private List<String> dependencies;
}
