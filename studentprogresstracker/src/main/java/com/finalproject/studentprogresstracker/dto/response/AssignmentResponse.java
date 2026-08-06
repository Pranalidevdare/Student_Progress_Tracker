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
public class AssignmentResponse {

    private String id;

    private String trainerId;

    private String trainerName;

    private String batchId;

    private String title;

    private String description;

    private String subject;

    private Integer totalMarks;

    private LocalDate assignedDate;

    private LocalDate dueDate;

    private String attachmentUrl;

    private String status;

}