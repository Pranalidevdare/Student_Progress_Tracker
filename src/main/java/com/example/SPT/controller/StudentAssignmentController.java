package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.request.AssignmentSubmissionRequest;
import com.example.SPT.dto.response.AssignmentResponse;
import com.example.SPT.dto.response.AssignmentSubmissionDetailResponse;
import com.example.SPT.service.AssignmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/assignments")
@RequiredArgsConstructor
@CrossOrigin("*")
public class StudentAssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping("/{batchId}")
    public ResponseEntity<List<AssignmentResponse>> getAssignments(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentsByBatch(batchId));
    }

    @GetMapping("/{assignmentId}/submission")
    public ResponseEntity<AssignmentSubmissionDetailResponse> getStudentSubmission(
            @PathVariable String assignmentId,
            @RequestParam String studentId) {

        return ResponseEntity.ok(
                assignmentService.getStudentAssignmentSubmission(assignmentId, studentId));
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitAssignment(
            @Valid @RequestBody AssignmentSubmissionRequest request) {

        assignmentService.submitAssignment(request);

        return ResponseEntity.ok("Assignment saved successfully.");
    }

}