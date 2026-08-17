package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.response.FeedbackResponse;
import com.example.SPT.service.FeedbackService;

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