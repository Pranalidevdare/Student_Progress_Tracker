package com.example.SPT.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest {

    @NotBlank(message = "Student Id is required")
    private String studentId;

    @NotBlank(message = "Trainer Id is required")
    private String trainerId;

    @NotBlank(message = "Batch Id is required")
    private String batchId;

    @NotNull(message = "Attendance Date is required")
    private LocalDate attendanceDate;

    @NotBlank(message = "Attendance Status is required")
    private String status;

    private String remarks;
}