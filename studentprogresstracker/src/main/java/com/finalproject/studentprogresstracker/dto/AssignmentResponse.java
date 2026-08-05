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
public class AssignmentResponse {

    private String assignmentId;

    private String trainerId;

    private String batchId;

    private String title;

    private String description;

    private LocalDate assignedDate;

    private LocalDate dueDate;

    private String status;

}