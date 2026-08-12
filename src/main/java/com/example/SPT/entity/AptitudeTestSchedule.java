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
@Document(collection = "aptitude_test_schedules")
public class AptitudeTestSchedule {

    @Id
    private String id;

    // Test Details
    private String testName;

    private LocalDate testDate;

    private LocalTime startTime;

    private LocalTime endTime;

    // Training Center
    private String trainingCenter;

    private String address;

    // Test Instructions
    private String instructions;

    // Test Status
    /**
     * SCHEDULED
     * COMPLETED
     * CANCELLED
     */
    private String status;

    // Audit Fields
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}