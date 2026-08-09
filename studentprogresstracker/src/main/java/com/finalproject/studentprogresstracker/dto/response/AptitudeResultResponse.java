package com.finalproject.studentprogresstracker.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeResultResponse {

    // Candidate Details
    private String id;

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
     * Possible values:
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
}