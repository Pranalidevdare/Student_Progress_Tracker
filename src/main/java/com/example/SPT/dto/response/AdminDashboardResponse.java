package com.example.SPT.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    private long totalStudents;

    private long totalTechnicalTrainers;

    private long totalSoftSkillTrainers;

    private long totalAdmins;
    
    private long totalTrainers;

    private long totalApplications;

    private long totalUsers;

    private long totalBatches;

    private long activeBatches;

    private long completedBatches;

    private long pendingApplications;

    private long shortlistedStudents;

    private long technicalInterviewPending;

    private long hrInterviewPending;

    private long homeVisitPending;

    private long documentsPending;

    private long selectedStudents;

    private long rejectedStudents;

    private long todayAttendance;

}