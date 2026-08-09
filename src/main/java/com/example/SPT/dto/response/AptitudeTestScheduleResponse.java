package com.example.SPT.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeTestScheduleResponse {

    private String id;

    // Test Details
    private String testName;

    private LocalDate testDate;

    private LocalTime startTime;

    private LocalTime endTime;

    // Training Center
    private String trainingCenter;

    private String address;

    // Instructions
    private String instructions;

    // Status
    private String status;

    // Audit
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}