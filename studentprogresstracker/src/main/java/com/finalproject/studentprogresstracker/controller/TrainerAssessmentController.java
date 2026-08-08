package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.dto.request.AssessmentRequest;
import com.finalproject.studentprogresstracker.dto.response.AssessmentResponse;
import com.finalproject.studentprogresstracker.service.AssessmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/assessments")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrainerAssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping
    public ResponseEntity<AssessmentResponse> createAssessment(
            @Valid @RequestBody AssessmentRequest request) {

        return new ResponseEntity<>(
                assessmentService.createAssessment(request),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssessmentResponse> updateAssessment(
            @PathVariable String id,
            @Valid @RequestBody AssessmentRequest request) {

        return ResponseEntity.ok(
                assessmentService.updateAssessment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAssessment(
            @PathVariable String id) {

        assessmentService.deleteAssessment(id);

        return ResponseEntity.ok("Assessment deleted successfully.");
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<AssessmentResponse>> getAssessments(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                assessmentService.getAssessmentsByBatch(batchId));
    }

}