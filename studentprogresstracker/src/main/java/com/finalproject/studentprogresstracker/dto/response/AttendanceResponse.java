package com.finalproject.studentprogresstracker.dto.response;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {

    private String id;

    private String studentId;

    private String studentName;

    private String trainerId;

    private String trainerName;

    private String batchId;

    private LocalDate attendanceDate;

    private String status;

    private String remarks;

}