package com.xaistudymate.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Stores each prediction/explanation request and its results.
 * Student input is snapshotted so history is preserved even if the profile changes.
 */
@Entity
@Table(name = "prediction_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ── Snapshot of student input at prediction time ────────────────
    @Column(nullable = false, length = 10)
    private String gender;

    private int age;

    @Column(length = 20)
    private String degree;

    @Column(length = 30)
    private String branch;

    private double cgpa;
    private int backlogs;
    private int internships;
    private int certifications;

    @Column(name = "coding_skills")
    private int codingSkills;

    @Column(name = "communication_skills")
    private int communicationSkills;

    @Column(name = "aptitude_score")
    private int aptitudeScore;

    private int projects;

    // ── Prediction results ─────────────────────────────────────────
    private boolean placed;

    @Column(name = "placement_probability")
    private double placementProbability;

    @Column(name = "predicted_package")
    private double predictedPackage;

    @Column(name = "risk_level", length = 20)
    private String riskLevel;

    private double confidence;

    // ── SHAP explanations (stored as JSON string) ───────────────────
    @Column(name = "explanations", length = 10000)
    private String explanationsJson;

    @Column(name = "top_strengths", length = 2000)
    private String topStrengthsJson;

    @Column(name = "top_weaknesses", length = 2000)
    private String topWeaknessesJson;

    // ── Study plan (stored as JSON string) ─────────────────────────
    @Column(name = "study_plan", length = 10000)
    private String studyPlanJson;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String type = "PREDICT";  // PREDICT, EXPLAIN, STUDY_PLAN

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
