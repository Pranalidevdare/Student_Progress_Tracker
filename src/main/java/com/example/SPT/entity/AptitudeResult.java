package com.example.SPT.entity;

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
@Document(collection = "aptitude_results")
public class AptitudeResult {

    @Id
    private String id;

    // Candidate Details
    private String candidateId;

    private String candidateName;

    // Assessment Details
    private String assessmentId;

    private String assessmentType;

    // Question Statistics
    private Integer totalQuestions;

    private Integer attemptedQuestions;

    private Integer correctAnswers;

    private Integer wrongAnswers;

    private Integer unattemptedQuestions;

    // Marks
    private Integer marksObtained;

    private Integer totalMarks;

    // Percentage
    private Double percentage;

    /*
     * Status:
     *
     * NOT_STARTED
     * IN_PROGRESS
     * SUBMITTED
     * PASS
     * FAIL
     */
    private String status;

    // Timing
    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    private LocalDateTime evaluatedAt;

    // Audit
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}