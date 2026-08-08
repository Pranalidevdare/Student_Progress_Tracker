package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.dto.request.AssignmentRequest;
import com.finalproject.studentprogresstracker.dto.response.AssignmentResponse;
import com.finalproject.studentprogresstracker.service.AssignmentService;

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

}