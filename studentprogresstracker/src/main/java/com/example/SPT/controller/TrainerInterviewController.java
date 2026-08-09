package com.example.SPT.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.request.InterviewRequest;
import com.example.SPT.dto.response.InterviewResponse;
import com.example.SPT.service.InterviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/interviews")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrainerInterviewController {

    private final InterviewService interviewService;

    @PostMapping
    public ResponseEntity<InterviewResponse> conductInterview(
            @Valid @RequestBody InterviewRequest request) {

        return new ResponseEntity<>(
                interviewService.conductInterview(request),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InterviewResponse> updateInterview(
            @PathVariable String id,
            @Valid @RequestBody InterviewRequest request) {

        return ResponseEntity.ok(
                interviewService.updateInterview(id, request));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<InterviewResponse> getInterview(
            @PathVariable String studentId) {

        return ResponseEntity.ok(
                interviewService.getInterviewByStudent(studentId));
    }

}