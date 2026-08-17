package com.example.SPT.mapper;

import org.springframework.stereotype.Component;

import com.example.SPT.dto.response.BatchResponse;
import com.example.SPT.entity.Batch;

@Component
public class BatchMapper {

    public BatchResponse toResponse(Batch batch) {
        if (batch == null) {
            return null;
        }

        return BatchResponse.builder()
                .id(batch.getId())
                .batchName(batch.getBatchName())
                .courseName(batch.getCourseName())
                .technicalTrainerId(batch.getTechnicalTrainer() != null ? batch.getTechnicalTrainer().getId() : null)
                .technicalTrainerName(batch.getTechnicalTrainer() != null ? batch.getTechnicalTrainer().getFullName() : null)
                .softSkillsTrainerId(batch.getSoftSkillsTrainer() != null ? batch.getSoftSkillsTrainer().getId() : null)
                .softSkillsTrainerName(batch.getSoftSkillsTrainer() != null ? batch.getSoftSkillsTrainer().getFullName() : null)
                .startDate(batch.getStartDate())
                .endDate(batch.getEndDate())
                .capacity(batch.getCapacity())
                .status(batch.getStatus())
                .build();
    }

}
