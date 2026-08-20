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
public class StudentPersonalAttendanceResponse {

    private String studentId;
    private String studentName;
    private String studentEmail;
    private String batchId;
    private String batchName;

    private double overallAttendance;
    private double overallAttendancePercentage; // alias for UI consistency

    private long daysPresent;
    private long daysLate;
    private long daysAbsent;
    private long daysLeave;

    private long totalEntries;
    private long totalAttendanceDays; // alias

    private List<AttendanceResponse> records;
}
