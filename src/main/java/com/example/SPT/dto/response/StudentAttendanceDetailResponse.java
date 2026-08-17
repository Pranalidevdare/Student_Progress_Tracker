package com.example.SPT.dto.response;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAttendanceDetailResponse {

    private String studentId;
    private String studentName;
    private String studentEmail;
    private String batchId;

    private String todayStatus; // PRESENT, ABSENT, LATE, LEAVE, NOT MARKED
    private String todayRemarks;
    private String todayAttendanceId;

    private LocalDate lastAttendanceDate;
    private String lastAttendanceStatus;

    private double overallAttendancePercentage;
    private long totalSessions;
    private long presentSessions;
    private boolean lowAttendanceWarning;
}
