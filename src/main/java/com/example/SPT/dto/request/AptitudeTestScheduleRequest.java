package com.example.SPT.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeTestScheduleRequest {

    @NotBlank(message = "Test name is required")
    private String testName;

    @NotNull(message = "Test date is required")
    @FutureOrPresent(message = "Test date cannot be in the past")
    private LocalDate testDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Training center is required")
    private String trainingCenter;

    @NotBlank(message = "Address is required")
    private String address;

    private String instructions;
}