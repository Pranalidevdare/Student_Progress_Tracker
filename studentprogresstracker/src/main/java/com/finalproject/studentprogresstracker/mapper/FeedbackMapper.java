package com.finalproject.studentprogresstracker.mapper;

import org.springframework.stereotype.Component;

import com.finalproject.studentprogresstracker.dto.response.FeedbackResponse;
import com.finalproject.studentprogresstracker.entity.Feedback;

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
                .subject(feedback.getSubject())
                .comments(feedback.getComments())
                .status(feedback.getStatus())
                .trainerResponse(feedback.getTrainerResponse())
                .build();
    }
}