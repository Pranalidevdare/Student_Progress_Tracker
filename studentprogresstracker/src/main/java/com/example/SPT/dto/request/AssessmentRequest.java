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
public class AssessmentRequest {

    @NotBlank(message = "Trainer Id is required")
    private String trainerId;

    @NotBlank(message = "Batch Id is required")
    private String batchId;

    @NotBlank(message = "Assessment title is required")
    private String title;

    @NotBlank(message = "Subject is required")
    private String subject;

    private String description;

    @NotNull(message = "Total Marks is required")
    private Integer totalMarks;

    @NotNull(message = "Duration is required")
    private Integer durationInMinutes;

    @NotNull(message = "Assessment Date is required")
    private LocalDate assessmentDate;

    @NotNull(message = "Submission Date is required")
    private LocalDate lastSubmissionDate;

    private String status;
}