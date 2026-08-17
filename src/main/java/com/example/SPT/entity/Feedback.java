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
@Document(collection = "feedback")
public class Feedback {

    @Id
    private String id;

    // Student Details
    private String studentId;
    private String studentName;

    // Trainer Details
    private String trainerId;
    private String trainerName;

    // Batch Details
    private String batchId;

    // Feedback & Query Details
    private Integer rating;
    private Double overallRating;
    private String subject;
    private String comments;
    private String status; // PENDING, REVIEWED, OPEN, IN_PROGRESS, RESOLVED
    private String trainerResponse;

    // Additional Context
    private String trainerType; // TECHNICAL or SOFT_SKILL
    private String direction;   // STUDENT_TO_TRAINER, TRAINER_TO_STUDENT, or QUERY
    private String strengths;
    private String areasForImprovement;
    private String trainerRemarks;
    private String sessionTitle;

    // Audit Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}