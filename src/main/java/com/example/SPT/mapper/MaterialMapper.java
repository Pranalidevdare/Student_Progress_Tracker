package com.example.SPT.mapper;

import org.springframework.stereotype.Component;

import com.example.SPT.dto.response.MaterialResponse;
import com.example.SPT.entity.StudyMaterial;

@Component
public class MaterialMapper {

    public MaterialResponse toResponse(StudyMaterial material) {
        if (material == null) {
            return null;
        }

        String fileEndpoint = (material.getId() != null && !material.getId().isBlank())
                ? "/api/materials/" + material.getId() + "/file"
                : (material.getFileUrl() != null ? material.getFileUrl() : "");

        return MaterialResponse.builder()
                .id(material.getId())
                .trainerId(material.getTrainerId())
                .trainerName(material.getTrainerName())
                .batchId(material.getBatchId())
                .title(material.getTitle())
                .description(material.getDescription())
                .subject(material.getSubject())
                .materialType(material.getMaterialType())
                .fileName(material.getFileName())
                .fileUrl(fileEndpoint)
                .fileSize(material.getFileSize())
                .contentType(material.getContentType())
                .uploadedAt(material.getUploadedAt())
                .updatedAt(material.getUpdatedAt())
                .build();
    }
}