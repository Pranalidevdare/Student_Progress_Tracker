package com.finalproject.studentprogresstracker.mapper;

import org.springframework.stereotype.Component;

import com.finalproject.studentprogresstracker.dto.response.AssessmentResponse;
import com.finalproject.studentprogresstracker.entity.MonthlyAssessment;

@Component
public class AssessmentMapper {

    public AssessmentResponse toResponse(MonthlyAssessment assessment) {

        if (assessment == null) {
            return null;
        }

        return AssessmentResponse.builder()
                .id(assessment.getId())
                .trainerId(assessment.getTrainerId())
                .trainerName(assessment.getTrainerName())
                .batchId(assessment.getBatchId())
                .title(assessment.getTitle())
                .subject(assessment.getSubject())
                .description(assessment.getDescription())
                .totalMarks(assessment.getTotalMarks())
                .durationInMinutes(assessment.getDurationInMinutes())
                .assessmentDate(assessment.getAssessmentDate())
                .lastSubmissionDate(assessment.getLastSubmissionDate())
                .status(assessment.getStatus())
                .build();
    }
}