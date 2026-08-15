package com.example.SPT.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private String id;
    private String studentId;
    private String title;
    private String message;
    private String type;
    private String relatedEntityId;
    private String referenceId;
    private String referenceType;
    private String batchId;
    private String trainerId;
    private boolean read;
    private LocalDateTime createdAt;
}
