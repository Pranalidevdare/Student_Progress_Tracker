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
    private String studentId;
    private String studentName;
    private String email;

    // Batch Information
    private String batchId;
    private String batchName;
    private String courseName;
    private BatchInfo batch;

    // Attendance
    private Double attendancePercentage;
    private Integer presentDays;
    private Integer absentDays;
    private Integer totalAttendanceDays;

    // Assignment
    private Integer totalAssignments;
    private Integer completedAssignments;
    private Integer pendingAssignments;
    private Double assignmentCompletionPercentage;

    // Assessment
    private Integer totalAssessments;
    private Double assessmentPercentage;
    private Double averageAssessment; // alias for assessmentPercentage

    // Performance & Analytics
    private Double overallPerformance;
    private Integer currentRank;
    private Integer batchRank; // alias for currentRank
    private Integer totalBatchStudents;
    private Integer batchSize; // alias for totalBatchStudents
    private String performanceStatus;
    private String trendStatus; // "Improving", "Stable", "Needs Attention"

    // Analytics Datasets
    private List<AssessmentTrendPoint> performanceTrend;
    private List<SubjectPerformancePoint> subjectPerformance;
    private List<TopperResponse> batchLeaderboard;

    // Study Material & Widgets
    private Integer totalStudyMaterials;
    private List<NoticeResponse> latestNotices;
    private List<GuestSessionResponse> guestSessions;
    private InterviewResponse upcomingInterview;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchInfo {
        private String id;
        private String name;
        private String courseName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssessmentTrendPoint {
        private String title;
        private Double score;
        private String date;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectPerformancePoint {
        private String subject;
        private Double score;
        private Integer totalAssessments;
    }
}