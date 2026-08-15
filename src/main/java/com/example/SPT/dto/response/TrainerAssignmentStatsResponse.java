package com.example.SPT.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerAssignmentStatsResponse {

    private String batchId;
    private String batchName;
    private long totalAssignments;
    private long totalStudents;
    private long totalSubmitted;
    private long totalPending;
    private long totalEvaluated;
    private long pendingEvaluation;
}
