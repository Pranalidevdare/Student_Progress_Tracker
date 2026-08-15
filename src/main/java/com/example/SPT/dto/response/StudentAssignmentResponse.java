package com.example.SPT.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAssignmentResponse {

    // Assignment Details
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
    private String submissionType;

    // Student Specific Submission Details
    private String submissionId;
    private String submissionFileUrl;
    private String submissionRemarks;
    private LocalDateTime submittedAt;
    private Integer obtainedMarks;
    private String trainerRemarks;

    /**
     * Computed Status:
     * PENDING
     * SUBMITTED
     * UNDER_EVALUATION
     * EVALUATED
     * OVERDUE
     */
    private String status;
}
