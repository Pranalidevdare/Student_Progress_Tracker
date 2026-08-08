package com.finalproject.studentprogresstracker.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
@Document(collection = "guest_sessions")
public class GuestSession {

    @Id
    private String id;

    private String title;

    private String speakerName;

    private String companyName;
    
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