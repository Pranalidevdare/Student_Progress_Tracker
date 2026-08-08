package com.finalproject.studentprogresstracker.entity;

import java.time.LocalDate;
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
@Document(collection = "monthly_assessments")
public class MonthlyAssessment {

    @Id
    private String id;

    // Trainer Details
    private String trainerId;
    private String trainerName;

    // Batch Details
    private String batchId;

    // Assessment Details
    private String title;
    private String subject;
    private String description;

    // Marks & Duration
    private Integer totalMarks;
    private Integer durationInMinutes;

    // Schedule
    private LocalDate assessmentDate;
    private LocalDate lastSubmissionDate;

    /**
     * DRAFT
     * PUBLISHED
     * CLOSED
     */
    private String status;

    // Audit Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}