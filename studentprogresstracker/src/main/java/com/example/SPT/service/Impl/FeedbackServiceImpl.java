package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
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
                .trainerId(request.getTrainerId())
                .rating(request.getRating())
                .subject(request.getSubject())
                .comments(request.getComments())
                .status("PENDING")
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

        return feedbackRepository.findByStudentId(studentId)
                .stream()
                .map(feedbackMapper::toResponse)
                .collect(Collectors.toList());
    }

}