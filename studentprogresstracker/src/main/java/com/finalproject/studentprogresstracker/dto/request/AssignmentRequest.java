package com.finalproject.studentprogresstracker.dto.request;

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
public class AssignmentRequest {

    @NotBlank(message = "Trainer Id is required")
    private String trainerId;

    @NotBlank(message = "Batch Id is required")
    private String batchId;

    @NotBlank(message = "Assignment title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotNull(message = "Total Marks is required")
    private Integer totalMarks;

    @NotNull(message = "Assigned Date is required")
    private LocalDate assignedDate;

    @NotNull(message = "Due Date is required")
    private LocalDate dueDate;

    private String attachmentUrl;

    private String status;
}