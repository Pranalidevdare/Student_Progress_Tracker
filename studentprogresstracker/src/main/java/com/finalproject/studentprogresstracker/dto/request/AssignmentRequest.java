package com.finalproject.studentprogresstracker.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentRequest {

    @NotBlank(message = "Trainer ID is required")
    private String trainerId;

    @NotBlank(message = "Batch ID is required")
    private String batchId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Due date is required")
    @Future(message = "Due date must be a future date")
    private LocalDate dueDate;

}