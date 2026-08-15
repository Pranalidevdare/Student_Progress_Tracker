package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.FeedbackRequest;
import com.example.SPT.dto.response.FeedbackResponse;
import com.example.SPT.entity.Feedback;
import com.example.SPT.mapper.FeedbackMapper;
import com.example.SPT.repository.FeedbackRepository;
import com.example.SPT.service.FeedbackService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackMapper feedbackMapper;

    @Override
    public FeedbackResponse submitFeedback(FeedbackRequest request) {

        Feedback feedback = Feedback.builder()
                .studentId(request.getStudentId())
                .studentName(request.getStudentName() != null ? request.getStudentName() : "Student Candidate")
                .trainerId(request.getTrainerId() != null ? request.getTrainerId() : "TRAINER001")
                .trainerName(request.getTrainerName() != null ? request.getTrainerName() : "Faculty Trainer")
                .batchId(request.getBatchId() != null ? request.getBatchId() : "BATCH001")
                .rating(request.getRating())
                .overallRating(request.getOverallRating() != null ? request.getOverallRating() : (request.getRating() != null ? request.getRating().doubleValue() : 5.0))
                .subject(request.getSubject())
                .comments(request.getComments())
                .status(request.getStatus() != null ? request.getStatus() : "SUBMITTED")
                .trainerType(request.getTrainerType() != null ? request.getTrainerType() : "TECHNICAL")
                .direction(request.getDirection() != null ? request.getDirection() : "STUDENT_TO_TRAINER")
                .strengths(request.getStrengths())
                .areasForImprovement(request.getAreasForImprovement())
                .trainerRemarks(request.getTrainerRemarks())
                .sessionTitle(request.getSessionTitle())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Feedback savedFeedback = feedbackRepository.save(feedback);

        return feedbackMapper.toResponse(savedFeedback);
    }

    @Override
    public List<FeedbackResponse> getFeedbackByTrainer(String trainerId) {

        return feedbackRepository.findByTrainerId(trainerId)
                .stream()
                .map(feedbackMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponse> getFeedbackByStudent(String studentId) {
        List<Feedback> feedbacks = feedbackRepository.findByStudentId(studentId);

        if (feedbacks.isEmpty() && studentId != null) {
            List<Feedback> all = feedbackRepository.findAll();
            for (Feedback f : all) {
                if (f.getStudentId() != null && f.getStudentId().equalsIgnoreCase(studentId)) {
                    feedbacks.add(f);
                } else if (f.getStudentName() != null && f.getStudentName().equalsIgnoreCase(studentId)) {
                    feedbacks.add(f);
                }
            }
        }

        return feedbacks.stream()
                .map(feedbackMapper::toResponse)
                .collect(Collectors.toList());
    }

}