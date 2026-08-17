package com.example.SPT.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

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
@Document(collection = "aptitude_schedules")
public class AptitudeSchedule {

    @Id
    private String id;

    // Test Details
    private String testId;
    private String testTitle;

    // Schedule Details
    private LocalDate testDate;
    private LocalTime startTime;
    private LocalTime endTime;

    // Location
    private String trainingCenter;

    // Eligibility
    private String eligibilityCriteria;

    // Status
    /**
     * SCHEDULED
     * COMPLETED
     * CANCELLED
     */
    private String status;

    // Created By Admin
    private String scheduledByAdminId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}