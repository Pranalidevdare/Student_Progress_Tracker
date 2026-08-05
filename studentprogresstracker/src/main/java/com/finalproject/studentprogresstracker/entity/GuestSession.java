package com.finalproject.studentprogresstracker.entity;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "guest_sessions")
public class GuestSession {

    @Id
    private String sessionId;

    private String trainerId;

    private String speakerName;

    private String topic;

    private LocalDate sessionDate;

    private String venue;

    private String description;
}