package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.FeedbackRequest;
import com.example.SPT.dto.response.FeedbackResponse;

public interface FeedbackService {

    FeedbackResponse submitFeedback(FeedbackRequest request);

    List<FeedbackResponse> getFeedbackByTrainer(String trainerId);

    List<FeedbackResponse> getFeedbackByStudent(String studentId);

}