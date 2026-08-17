package com.example.SPT.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialResponse {

    private String id;

    private String trainerId;

    private String trainerName;

    private String batchId;

    private String title;

    private String description;

    private String subject;

    private String materialType;

    private String fileName;

    private String fileUrl;

    private Long fileSize;

    private String contentType;

    private java.time.LocalDateTime uploadedAt;

    private java.time.LocalDateTime updatedAt;

}