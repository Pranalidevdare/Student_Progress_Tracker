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
public class AptitudeScheduleResponse {

    private String id;

    private String testId;

    private String testTitle;

    private LocalDate testDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String trainingCenter;

    private String eligibilityCriteria;

    private String status;

    private String scheduledByAdminId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}