package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.dto.request.FeedbackRequest;
import com.finalproject.studentprogresstracker.dto.response.FeedbackResponse;
import com.finalproject.studentprogresstracker.service.FeedbackService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/feedback")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StudentFeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @Valid @RequestBody FeedbackRequest request) {

        return new ResponseEntity<>(
                feedbackService.submitFeedback(request),
                HttpStatus.CREATED);
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<List<FeedbackResponse>> getFeedbackByStudent(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                feedbackService.getFeedbackByStudent(studentId));
    }

}