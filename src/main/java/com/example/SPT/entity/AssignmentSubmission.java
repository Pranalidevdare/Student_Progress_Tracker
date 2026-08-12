package com.example.SPT.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "assignment_submissions")
public class AssignmentSubmission {

    @Id
    private String id;

    // Assignment Details
    private String assignmentId;
    private String assignmentTitle;

    // Student Details
    private String studentId;
    private String studentName;

    // Trainer Details
    private String trainerId;
    private String trainerName;

    // Batch Details
    private String batchId;

    // Submission Details
    private String submissionFileUrl;
    private String submissionRemarks;

    private LocalDateTime submittedAt;

    // Evaluation Details
    private Integer obtainedMarks;
    private String trainerRemarks;

    /**
     * PENDING
     * EVALUATED
     * REJECTED
     */
    private String status;

    // Audit Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}