package com.finalproject.studentprogresstracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerDashboardResponse {

    private TrainerResponse trainer;

    private Integer totalStudents;

    private Integer totalAssignments;

    private Integer totalAssessments;

    private Integer totalStudyMaterials;

    private Integer totalInterviews;

    private Integer attendanceMarkedToday;

}