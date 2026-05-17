package com.xaistudymate.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Aggregated dashboard data for the authenticated user.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private String fullName;
    private String email;
    private boolean hasProfile;
    private int totalPredictions;
    private Double latestProbability;
    private Double latestPackage;
    private String latestRiskLevel;
    private List<Map<String, Object>> recentPredictions;
    private List<Map<String, Object>> probabilityTrend;
}
