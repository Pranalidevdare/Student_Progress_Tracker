package com.finalproject.studentprogresstracker.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestRequest {

    @NotBlank(message = "Trainer ID is required")
    private String trainerId;

    @NotBlank(message = "Batch ID is required")
    private String batchId;

    @NotBlank(message = "Test title is required")
    private String testTitle;

    @NotNull(message = "Test date is required")
    @FutureOrPresent(message = "Test date must be today or a future date")
    private LocalDate testDate;

    @Positive(message = "Duration must be greater than 0")
    private int duration;

    @Positive(message = "Total marks must be greater than 0")
    private int totalMarks;

}