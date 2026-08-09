package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.request.AssignmentSubmissionRequest;
import com.example.SPT.dto.response.AssignmentResponse;
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

    @PostMapping("/submit")
    public ResponseEntity<String> submitAssignment(
            @Valid @RequestBody AssignmentSubmissionRequest request) {

        assignmentService.submitAssignment(request);

        return ResponseEntity.ok("Assignment submitted successfully.");
    }

}