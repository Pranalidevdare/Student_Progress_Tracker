package com.finalproject.studentprogresstracker.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceRequest {

    @NotBlank(message = "Trainer ID is required")
    private String trainerId;

    @NotBlank(message = "Student ID is required")
    private String studentId;

    @Min(value = 0, message = "Attendance percentage cannot be less than 0")
    @Max(value = 100, message = "Attendance percentage cannot be greater than 100")
    private double attendancePercentage;

    @Min(value = 0, message = "Assignment marks cannot be negative")
    private double assignmentMarks;

    @Min(value = 0, message = "Test marks cannot be negative")
    private double testMarks;

    @NotBlank(message = "Overall performance is required")
    private String overallPerformance;

    private String remarks;

}