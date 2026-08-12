package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.request.AssessmentSubmissionRequest;
import com.example.SPT.dto.response.AssessmentResponse;
import com.example.SPT.service.AssessmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/assessments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentAssessmentController {

    private final AssessmentService assessmentService;

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<AssessmentResponse>> getAssessments(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                assessmentService.getAssessmentsByBatch(batchId));
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitAssessment(
            @Valid @RequestBody AssessmentSubmissionRequest request) {

        assessmentService.submitAssessment(request);

        return ResponseEntity.ok("Assessment submitted successfully.");
    }

}