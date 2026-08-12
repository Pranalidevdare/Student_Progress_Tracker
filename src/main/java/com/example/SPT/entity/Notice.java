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
@Document(collection = "notices")
public class Notice {

    @Id
    private String id;

    // Notice Details
    private String title;

    private String description;

    /**
     * GENERAL
     * ACADEMIC
     * PLACEMENT
     * EVENT
     * HOLIDAY
     * EXAM
     */
    private String category;

    /**
     * HIGH
     * MEDIUM
     * LOW
     */
    private String priority;

    // Audience
    private String batchId;

    // Trainer Details
    private String trainerId;

    private String trainerName;

    // Dates
    private LocalDate publishDate;

    private LocalDate expiryDate;

    // Status
    private Boolean active;

    // Audit Fields
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}