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
@Document(collection = "study_materials")
public class StudyMaterial {

    @Id
    private String id;

    // Trainer Details
    private String trainerId;
    private String trainerName;

    // Batch Details
    private String batchId;

    // Material Details
    private String title;
    private String description;
    private String subject;

    /**
     * PDF
     * PPT
     * VIDEO
     * DOCUMENT
     */
    private String materialType;

    // File Details
    private String fileName;
    private String fileUrl;

    // Audit Fields
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;
}