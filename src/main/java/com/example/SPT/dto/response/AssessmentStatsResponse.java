package com.example.SPT.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentStatsResponse {
    private String assessmentId;
    private String assessmentTitle;
    private Long totalStudents;
    private Long attemptedCount;
    private Long notAttemptedCount;
    private Long evaluatedCount;
    private Long pendingEvaluationCount;
    private Long passedCount;
    private Long failedCount;
    private Double attemptRate;
}
