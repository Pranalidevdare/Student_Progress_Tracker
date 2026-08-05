package com.finalproject.studentprogresstracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.finalproject.studentprogresstracker.entity.Assignment;
import com.finalproject.studentprogresstracker.service.AssignmentService;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    // Add Assignment
    @PostMapping("/add")
    public ResponseEntity<Assignment> addAssignment(
            @RequestBody Assignment assignment) {

        return new ResponseEntity<>(
                assignmentService.addAssignment(assignment),
                HttpStatus.CREATED);
    }

    // Get All Assignments
    @GetMapping("/all")
    public ResponseEntity<List<Assignment>> getAllAssignments() {

        return ResponseEntity.ok(
                assignmentService.getAllAssignments());
    }

    // Get Assignment By Id
    @GetMapping("/{assignmentId}")
    public ResponseEntity<Assignment> getAssignmentById(
            @PathVariable String assignmentId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentById(assignmentId));
    }

    // Get Assignments By Trainer
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByTrainer(
            @PathVariable String trainerId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentByTrainer(trainerId));
    }

    // Get Assignments By Batch
    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByBatch(
            @PathVariable String batchId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentByBatch(batchId));
    }

    // Get Assignments By Status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Assignment>> getAssignmentsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentByStatus(status));
    }

    // Update Assignment
    @PutMapping("/update/{assignmentId}")
    public ResponseEntity<Assignment> updateAssignment(
            @PathVariable String assignmentId,
            @RequestBody Assignment assignment) {

        return ResponseEntity.ok(
                assignmentService.updateAssignment(assignmentId, assignment));
    }

    // Delete Assignment
    @DeleteMapping("/delete/{assignmentId}")
    public ResponseEntity<String> deleteAssignment(
            @PathVariable String assignmentId) {

        return ResponseEntity.ok(
                assignmentService.deleteAssignment(assignmentId));
    }

}