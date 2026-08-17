package com.example.SPT.mapper;

import org.springframework.stereotype.Component;

import com.example.SPT.dto.response.AssessmentResponse;
import com.example.SPT.entity.MonthlyAssessment;

@Component
public class AssessmentMapper {

    public AssessmentResponse toResponse(MonthlyAssessment assessment) {

        if (assessment == null) {
            return null;
        }

        String qSource = assessment.getQuestionSource();
        if (qSource == null || qSource.isBlank()) {
            qSource = (assessment.getQuestions() != null && !assessment.getQuestions().isEmpty()) ? "MANUAL" : "PDF";
        }

        return AssessmentResponse.builder()
                .id(assessment.getId())
                .trainerId(assessment.getTrainerId())
                .trainerName(assessment.getTrainerName())
                .batchId(assessment.getBatchId())
                .title(assessment.getTitle())
                .subject(assessment.getSubject())
                .assessmentType(assessment.getAssessmentType() != null ? assessment.getAssessmentType() : "QUIZ")
                .description(assessment.getDescription())
                .attachmentUrl(assessment.getAttachmentUrl())
                .questionSource(qSource)
                .questions(assessment.getQuestions())
                .totalMarks(assessment.getTotalMarks())
                .durationInMinutes(assessment.getDurationInMinutes())
                .assessmentDate(assessment.getAssessmentDate())
                .startTime(assessment.getStartTime() != null ? assessment.getStartTime() : "10:00 AM")
                .endTime(assessment.getEndTime() != null ? assessment.getEndTime() : "11:00 AM")
                .lastSubmissionDate(assessment.getLastSubmissionDate())
                .status(assessment.getStatus())
                .build();
    }
}