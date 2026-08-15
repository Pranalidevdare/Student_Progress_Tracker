package com.example.SPT.entity;

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
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String studentId;
    private String title;
    private String message;
    private String type; // ASSIGNMENT_CREATED, ASSESSMENT_CREATED, MATERIAL_UPLOADED
    private String relatedEntityId;
    private String referenceId;
    private String referenceType; // ASSIGNMENT, ASSESSMENT, MATERIAL
    private String batchId;
    private String trainerId;
    private boolean read;

    private LocalDateTime createdAt;
}
