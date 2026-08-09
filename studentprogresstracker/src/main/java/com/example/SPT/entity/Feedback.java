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

    // Feedback Details
    private Integer rating;

    private String subject;

    private String comments;

    /**
     * PENDING
     * REVIEWED
     */
    private String status;

    // Trainer Response (Optional)
    private String trainerResponse;

    // Audit Fields
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}