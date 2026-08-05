package com.finalproject.studentprogresstracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRequest {

    @NotBlank(message = "Trainer ID is required")
    private String trainerId;

    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotBlank(message = "Batch ID is required")
    private String batchId;

    @NotBlank(message = "Attendance status is required")
    private String status;
}