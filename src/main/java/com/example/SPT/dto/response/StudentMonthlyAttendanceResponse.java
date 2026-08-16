package com.example.SPT.dto.response;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentMonthlyAttendanceResponse {

    private String studentId;
    private String studentName;
    private String studentEmail;
    private String batchId;

    private int month;
    private int year;

    private long totalSessions;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private long leaveCount;

    private double attendancePercentage;
    private boolean lowAttendanceWarning;

    private List<DailyAttendanceDetail> dailyRecords;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyAttendanceDetail {
        private LocalDate date;
        private String technicalStatus;
        private String softSkillStatus;
        private String overallStatus;
        private String remarks;
    }
}
