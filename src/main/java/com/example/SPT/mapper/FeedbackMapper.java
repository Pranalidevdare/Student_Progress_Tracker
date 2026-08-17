package com.example.SPT.mapper;

import org.springframework.stereotype.Component;

import com.example.SPT.dto.response.FeedbackResponse;
import com.example.SPT.entity.Feedback;

@Component
public class FeedbackMapper {

    public FeedbackResponse toResponse(Feedback feedback) {

        if (feedback == null) {
            return null;
        }

        return FeedbackResponse.builder()
                .id(feedback.getId())
                .studentId(feedback.getStudentId())
                .studentName(feedback.getStudentName())
                .trainerId(feedback.getTrainerId())
                .trainerName(feedback.getTrainerName())
                .batchId(feedback.getBatchId())
                .rating(feedback.getRating())
                .overallRating(feedback.getOverallRating())
                .subject(feedback.getSubject())
                .comments(feedback.getComments())
                .status(feedback.getStatus())
                .trainerResponse(feedback.getTrainerResponse())
                .trainerType(feedback.getTrainerType())
                .direction(feedback.getDirection())
                .strengths(feedback.getStrengths())
                .areasForImprovement(feedback.getAreasForImprovement())
                .trainerRemarks(feedback.getTrainerRemarks())
                .sessionTitle(feedback.getSessionTitle())
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .build();
    }
}