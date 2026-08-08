package com.example.SPT.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestSessionResponse {

    private String id;

    private String title;

    private String speakerName;

    private String companyName;

    // ADD THESE
    private String designation;

    private String organization;

    private String topic;

    private String description;

    private LocalDate sessionDate;

    private String sessionTime;

    private String venue;

    private String batchId;

    private String trainerId;

    private String trainerName;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}