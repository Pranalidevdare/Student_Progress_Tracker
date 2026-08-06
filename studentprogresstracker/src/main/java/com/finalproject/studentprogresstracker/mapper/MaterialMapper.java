package com.finalproject.studentprogresstracker.mapper;

import org.springframework.stereotype.Component;

import com.finalproject.studentprogresstracker.dto.response.MaterialResponse;
import com.finalproject.studentprogresstracker.entity.StudyMaterial;

@Component
public class MaterialMapper {

    public MaterialResponse toResponse(StudyMaterial material) {

        if (material == null) {
            return null;
        }

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
                .fileUrl(material.getFileUrl())
                .build();
    }
}