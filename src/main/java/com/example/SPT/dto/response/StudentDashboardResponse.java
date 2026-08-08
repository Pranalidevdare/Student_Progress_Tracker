package com.example.SPT.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardResponse {

    // Student Profile
    private StudentResponse student;

    // Attendance
    private Double attendancePercentage;

    // Assignment
    private Integer totalAssignments;
    private Integer completedAssignments;
    private Integer pendingAssignments;

    // Assessment
    private Integer totalAssessments;
    private Double assessmentPercentage;

    // Performance
    private Double overallPerformance;
    private Integer currentRank;
    private String performanceStatus;

    // Study Material
    private Integer totalStudyMaterials;

    // Dashboard Widgets
    private List<NoticeResponse> latestNotices;

    private List<GuestSessionResponse> guestSessions;

    private InterviewResponse upcomingInterview;
}