package com.finalproject.studentprogresstracker.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponse {

    private String attendanceId;

    private String trainerId;

    private String studentId;

    private String batchId;

    private LocalDate attendanceDate;

    private String status;
}