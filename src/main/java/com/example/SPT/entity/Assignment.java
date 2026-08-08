package com.example.SPT.entity;

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
@Document(collection = "assignments")
public class Assignment {

    @Id
    private String id;

    // Trainer Details
    private String trainerId;
    private String trainerName;

    // Batch Details
    private String batchId;

    // Assignment Details
    private String title;
    private String description;
    private String subject;

    // Marks
    private Integer totalMarks;

    // Dates
    private LocalDate assignedDate;
    private LocalDate dueDate;

    // Attachment
    private String attachmentUrl;

    /**
     * ACTIVE
     * CLOSED
     */
    private String status;

    // Audit Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}