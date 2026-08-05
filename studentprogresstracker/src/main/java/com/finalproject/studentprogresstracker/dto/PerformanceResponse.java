package com.finalproject.studentprogresstracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceResponse {

    private String performanceId;

    private String trainerId;

    private String studentId;

    private double attendancePercentage;

    private double assignmentMarks;

    private double testMarks;

    private String overallPerformance;

    private String remarks;

}