package com.xaistudymate.backend.dto.student;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Student profile input — mirrors the AI service's StudentInput schema exactly.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentInputDTO {

    @NotBlank(message = "Gender is required")
    private String gender;

    @Min(18) @Max(30)
    private int age;

    @NotBlank(message = "Degree is required")
    private String degree;

    @NotBlank(message = "Branch is required")
    private String branch;

    @DecimalMin("0.0") @DecimalMax("10.0")
    private double cgpa;

    @Min(0) @Max(10)
    private int backlogs;

    @Min(0) @Max(5)
    private int internships;

    @Min(0) @Max(10)
    private int certifications;

    @Min(0) @Max(10)
    private int codingSkills;

    @Min(0) @Max(10)
    private int communicationSkills;

    @Min(0) @Max(100)
    private int aptitudeScore;

    @Min(0) @Max(10)
    private int projects;
}
