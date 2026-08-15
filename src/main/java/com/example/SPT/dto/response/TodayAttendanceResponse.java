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
public class TodayAttendanceResponse {

    private String batchId;
    private String batchName;
    private String sessionType;
    private LocalDate attendanceDate;

    private long totalStudents;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private long leaveCount;
    private long notMarkedCount;

    private double attendancePercentage;
    private double completionPercentage;

    private List<StudentAttendanceDetailResponse> students;
}
