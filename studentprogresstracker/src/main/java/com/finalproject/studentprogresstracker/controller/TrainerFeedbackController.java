package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.dto.response.FeedbackResponse;
import com.finalproject.studentprogresstracker.service.FeedbackService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/feedback")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrainerFeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping("/{trainerId}")
    public ResponseEntity<List<FeedbackResponse>> getFeedbackByTrainer(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                feedbackService.getFeedbackByTrainer(trainerId));
    }

}