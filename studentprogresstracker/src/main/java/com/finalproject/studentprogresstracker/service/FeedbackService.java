package com.finalproject.studentprogresstracker.service;

import java.util.List;

import com.finalproject.studentprogresstracker.dto.request.FeedbackRequest;
import com.finalproject.studentprogresstracker.dto.response.FeedbackResponse;

public interface FeedbackService {

    FeedbackResponse submitFeedback(FeedbackRequest request);

    List<FeedbackResponse> getFeedbackByTrainer(String trainerId);

    List<FeedbackResponse> getFeedbackByStudent(String studentId);

}