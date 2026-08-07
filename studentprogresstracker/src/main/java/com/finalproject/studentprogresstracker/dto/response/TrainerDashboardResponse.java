package com.finalproject.studentprogresstracker.dto.response;

import java.util.List;

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
    private Integer totalGuestSessions;

    private Integer totalNotices;

    private List<TopperResponse> topPerformers;

    private List<NoticeResponse> latestNotices;

    private List<GuestSessionResponse> upcomingGuestSessions;

}