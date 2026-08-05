package com.finalproject.studentprogresstracker.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestSessionRequest {

    @NotBlank(message = "Trainer ID is required")
    private String trainerId;

    @NotBlank(message = "Speaker name is required")
    private String speakerName;

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotNull(message = "Session date is required")
    @FutureOrPresent(message = "Session date must be today or a future date")
    private LocalDate sessionDate;

    @NotBlank(message = "Venue is required")
    private String venue;

    @NotBlank(message = "Description is required")
    private String description;

}