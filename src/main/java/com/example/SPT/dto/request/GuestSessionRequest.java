package com.example.SPT.dto.request;

import java.time.LocalDate;

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
public class GuestSessionRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Speaker name is required")
    private String speakerName;

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Session date is required")
    @FutureOrPresent(message = "Session date must be today or in the future")
    private LocalDate sessionDate;

    @NotBlank(message = "Session time is required")
    private String sessionTime;

    @NotBlank(message = "Venue is required")
    private String venue;

    @NotBlank(message = "Batch ID is required")
    private String batchId;

    @NotBlank(message = "Trainer ID is required")
    private String trainerId;

    @NotBlank(message = "Trainer name is required")
    private String trainerName;
}