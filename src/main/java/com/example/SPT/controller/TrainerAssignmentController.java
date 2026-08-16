package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.request.AssignmentRequest;
import com.example.SPT.dto.request.EvaluationRequest;
import com.example.SPT.dto.request.TrainerBatchSwitchRequest;
import com.example.SPT.dto.response.AssignmentResponse;
import com.example.SPT.dto.response.AssignmentSubmissionDetailResponse;
import com.example.SPT.dto.response.TrainerAssignmentStatsResponse;
import com.example.SPT.dto.response.TrainerResponse;
import com.example.SPT.entity.Batch;
import com.example.SPT.service.AssignmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trainer/assignments")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TrainerAssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping
    public ResponseEntity<AssignmentResponse> createAssignment(
            @Valid @RequestBody AssignmentRequest request) {

        return new ResponseEntity<>(
                assignmentService.createAssignment(request),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssignmentResponse> updateAssignment(
            @PathVariable String id,
            @Valid @RequestBody AssignmentRequest request) {

        return ResponseEntity.ok(
                assignmentService.updateAssignment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAssignment(
            @PathVariable String id) {

        assignmentService.deleteAssignment(id);

        return ResponseEntity.ok("Assignment deleted successfully.");
    }

    @GetMapping("/{batchId}")
    public ResponseEntity<List<AssignmentResponse>> getAssignments(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentsByBatch(batchId));
    }

    @GetMapping("/statistics")
    public ResponseEntity<TrainerAssignmentStatsResponse> getStatistics(
            @RequestParam String batchId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentStatistics(batchId));
    }

    @GetMapping("/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentSubmissionDetailResponse>> getAssignmentSubmissions(
            @PathVariable String assignmentId,
            @RequestParam String batchId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentSubmissions(assignmentId, batchId));
    }

    @PutMapping("/submissions/{submissionId}/evaluate")
    public ResponseEntity<AssignmentSubmissionDetailResponse> evaluateSubmission(
            @PathVariable String submissionId,
            @Valid @RequestBody EvaluationRequest request,
            Authentication authentication) {

        String trainerEmail = (authentication != null) ? authentication.getName() : null;
        return ResponseEntity.ok(
                assignmentService.evaluateSubmission(submissionId, request, trainerEmail));
    }

    @GetMapping("/batches")
    public ResponseEntity<List<Batch>> getAllBatches() {
        return ResponseEntity.ok(assignmentService.getAllBatches());
    }

    @PutMapping("/switch-batch")
    public ResponseEntity<TrainerResponse> switchTrainerBatch(
            @Valid @RequestBody TrainerBatchSwitchRequest request,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("User is not authenticated");
        }

        String trainerEmail = authentication.getName();
        return ResponseEntity.ok(
                assignmentService.switchTrainerBatch(trainerEmail, request));
    }

    @GetMapping("/detail/{assignmentId}")
    public ResponseEntity<AssignmentResponse> getAssignmentById(
            @PathVariable String assignmentId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentById(assignmentId));
    }

    @GetMapping("/{assignmentId}/stats")
    public ResponseEntity<TrainerAssignmentStatsResponse> getSingleAssignmentStatistics(
            @PathVariable String assignmentId,
            @RequestParam(required = false) String batchId) {

        return ResponseEntity.ok(
                assignmentService.getSingleAssignmentStatistics(assignmentId, batchId));
    }
}