package com.xaistudymate.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Stores the student's academic profile — maps 1:1 to the AI service input schema.
 */
@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 10)
    private String gender;

    @Column(nullable = false)
    private int age;

    @Column(nullable = false, length = 20)
    private String degree;

    @Column(nullable = false, length = 30)
    private String branch;

    @Column(nullable = false)
    private double cgpa;

    @Column(nullable = false)
    private int backlogs;

    @Column(nullable = false)
    private int internships;

    @Column(nullable = false)
    private int certifications;

    @Column(name = "coding_skills", nullable = false)
    private int codingSkills;

    @Column(name = "communication_skills", nullable = false)
    private int communicationSkills;

    @Column(name = "aptitude_score", nullable = false)
    private int aptitudeScore;

    @Column(nullable = false)
    private int projects;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
