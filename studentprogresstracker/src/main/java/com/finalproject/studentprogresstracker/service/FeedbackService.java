package com.finalproject.studentprogresstracker.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.entity.Feedback;
import com.finalproject.studentprogresstracker.repository.FeedbackRepository;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    // Add Feedback
    public Feedback addFeedback(Feedback feedback) {

        feedback.setFeedbackDate(LocalDate.now());

        return feedbackRepository.save(feedback);
    }

    // Get All Feedback
    public List<Feedback> getAllFeedback() {

        return feedbackRepository.findAll();
    }

    // Get Feedback By Id
    public Feedback getFeedbackById(String feedbackId) {

        return feedbackRepository.findById(feedbackId)
                .orElseThrow(() ->
                        new RuntimeException("Feedback Not Found"));
    }

    // Get Feedback By Student
    public List<Feedback> getFeedbackByStudent(String studentId) {

        return feedbackRepository.findByStudentId(studentId);
    }

    // Get Feedback By Trainer
    public List<Feedback> getFeedbackByTrainer(String trainerId) {

        return feedbackRepository.findByTrainerId(trainerId);
    }

    // Update Feedback
    public Feedback updateFeedback(String feedbackId,
                                   Feedback feedback) {

        Feedback existingFeedback =
                feedbackRepository.findById(feedbackId)
                        .orElseThrow(() ->
                                new RuntimeException("Feedback Not Found"));

        existingFeedback.setTrainerId(feedback.getTrainerId());
        existingFeedback.setStudentId(feedback.getStudentId());
        existingFeedback.setRating(feedback.getRating());
        existingFeedback.setFeedback(feedback.getFeedback());
        existingFeedback.setFeedbackDate(feedback.getFeedbackDate());

        return feedbackRepository.save(existingFeedback);
    }

    // Delete Feedback
    public String deleteFeedback(String feedbackId) {

        Feedback feedback =
                feedbackRepository.findById(feedbackId)
                        .orElseThrow(() ->
                                new RuntimeException("Feedback Not Found"));

        feedbackRepository.delete(feedback);

        return "Feedback Deleted Successfully";
    }

}