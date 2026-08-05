package com.finalproject.studentprogresstracker.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestSessionResponse {

    private String sessionId;

    private String trainerId;

    private String speakerName;

    private String topic;

    private LocalDate sessionDate;

    private String venue;

    private String description;

}