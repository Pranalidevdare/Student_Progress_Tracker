package com.finalproject.studentprogresstracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardResponse {

    private StudentResponse student;

    private Double attendancePercentage;

    private Integer totalAssignments;

    private Integer completedAssignments;

    private Integer pendingAssignments;

    private Integer totalAssessments;

    private Double assessmentPercentage;

    private Double overallPerformance;

    private Integer currentRank;

    private Integer totalStudyMaterials;

}