package com.example.SPT.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
    private String assessmentType;
    private String description;
    private String attachmentUrl;

    // Question Source ("MANUAL" or "PDF")
    private String questionSource;
    private List<AssignmentQuestion> questions;

    // Marks & Duration
    private Integer totalMarks;
    private Integer durationInMinutes;

    // Schedule
    private LocalDate assessmentDate;
    private String startTime; // e.g. "10:00 AM"
    private String endTime;   // e.g. "11:00 AM"
    private LocalDate lastSubmissionDate;

    /**
     * UPCOMING
     * LIVE
     * COMPLETED
     * CANCELLED
     */
    private String status;

    // Audit Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}