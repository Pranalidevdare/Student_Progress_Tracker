package com.finalproject.studentprogresstracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceResponse {

    private String id;

    private String studentId;

    private String studentName;

    private String batchId;

    private Double attendancePercentage;

    private Double assignmentPercentage;

    private Double assessmentPercentage;

    private Double interviewPercentage;

    private Double overallPercentage;

    private Integer rank;

    private String performanceStatus;

    private String remarks;

}