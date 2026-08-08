package com.finalproject.studentprogresstracker.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "assessment_results")
public class AssessmentResult {

    @Id
    private String id;

    // Assessment Details
    private String assessmentId;
    private String assessmentTitle;

    // Student Details
    private String studentId;
    private String studentName;

    // Trainer Details
    private String trainerId;
    private String trainerName;

    // Batch Details
    private String batchId;

    // Marks
    private Integer totalMarks;
    private Integer obtainedMarks;
    private Double percentage;

    // Result Status
    /**
     * PASS
     * FAIL
     */
    private String resultStatus;

    // Evaluation
    private String trainerRemarks;

    // Submission Time
    private LocalDateTime submittedAt;

    // Audit Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}