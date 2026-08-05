package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.entity.Feedback;
import com.finalproject.studentprogresstracker.service.FeedbackService;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    // Add Feedback
    @PostMapping("/add")
    public ResponseEntity<Feedback> addFeedback(
            @RequestBody Feedback feedback) {

        return new ResponseEntity<>(
                feedbackService.addFeedback(feedback),
                HttpStatus.CREATED);
    }

    // Get All Feedback
    @GetMapping("/all")
    public ResponseEntity<List<Feedback>> getAllFeedback() {

        return ResponseEntity.ok(
                feedbackService.getAllFeedback());
    }

    // Get Feedback By Id
    @GetMapping("/{feedbackId}")
    public ResponseEntity<Feedback> getFeedbackById(
            @PathVariable String feedbackId) {

        return ResponseEntity.ok(
                feedbackService.getFeedbackById(feedbackId));
    }

    // Get Feedback By Student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Feedback>> getFeedbackByStudent(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                feedbackService.getFeedbackByStudent(studentId));
    }

    // Get Feedback By Trainer
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<Feedback>> getFeedbackByTrainer(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                feedbackService.getFeedbackByTrainer(trainerId));
    }

    // Update Feedback
    @PutMapping("/update/{feedbackId}")
    public ResponseEntity<Feedback> updateFeedback(
            @PathVariable String feedbackId,
            @RequestBody Feedback feedback) {

        return ResponseEntity.ok(
                feedbackService.updateFeedback(feedbackId, feedback));
    }

    // Delete Feedback
    @DeleteMapping("/delete/{feedbackId}")
    public ResponseEntity<String> deleteFeedback(
            @PathVariable String feedbackId) {

        return ResponseEntity.ok(
                feedbackService.deleteFeedback(feedbackId));
    }

}