package com.example.SPT.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.SPT.dto.request.CreateBatchRequest;
import com.example.SPT.dto.response.BatchResponse;
import com.example.SPT.dto.response.StudentResponse;
import com.example.SPT.enums.BatchStatus;
import com.example.SPT.service.BatchService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BatchController {

    private final BatchService batchService;

    /**
     * Create a new batch with selected applications
     */
    @PostMapping({"/create", ""})
    public ResponseEntity<BatchResponse> createBatch(@Valid @RequestBody CreateBatchRequest request) {
        BatchResponse response = batchService.createBatch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all batches
     */
    @GetMapping
    public ResponseEntity<List<BatchResponse>> getAllBatches() {
        return ResponseEntity.ok(batchService.getAllBatches());
    }

    /**
     * Get active batches only (for assignment)
     */
    @GetMapping("/active")
    public ResponseEntity<List<BatchResponse>> getActiveBatches() {
        return ResponseEntity.ok(batchService.getActiveBatches());
    }

    /**
     * Get batches assigned to logged-in trainer
     */
    @GetMapping("/my-batches")
    public ResponseEntity<List<BatchResponse>> getMyBatches(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("User is not authenticated");
        }
        return ResponseEntity.ok(batchService.getBatchesByTrainer(authentication.getName()));
    }

    /**
     * Get batches assigned to specific trainer ID
     */
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<BatchResponse>> getBatchesByTrainer(
            @PathVariable String trainerId,
            Authentication authentication) {
        return ResponseEntity.ok(batchService.getBatchesByTrainer(trainerId));
    }

    /**
     * Get students enrolled in a specific batch
     */
    @GetMapping("/{batchId}/students")
    public ResponseEntity<List<StudentResponse>> getStudentsInBatch(
            @PathVariable String batchId,
            Authentication authentication) {
        return ResponseEntity.ok(batchService.getStudentsInBatch(batchId));
    }

    /**
     * Get batch by ID
     */
    @GetMapping("/{batchId}")
    public ResponseEntity<BatchResponse> getBatchById(@PathVariable String batchId) {
        return ResponseEntity.ok(batchService.getBatchById(batchId));
    }

    /**
     * Get batch by name
     */
    @GetMapping("/by-name/{batchName}")
    public ResponseEntity<BatchResponse> getBatchByName(@PathVariable String batchName) {
        return ResponseEntity.ok(batchService.getBatchByName(batchName));
    }

    /**
     * Get batches by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<BatchResponse>> getBatchesByStatus(@PathVariable BatchStatus status) {
        return ResponseEntity.ok(batchService.getBatchesByStatus(status));
    }

    /**
     * Get batches by course
     */
    @GetMapping("/course")
    public ResponseEntity<List<BatchResponse>> getBatchesByCourse(@RequestParam String courseName) {
        return ResponseEntity.ok(batchService.getBatchesByCourse(courseName));
    }

    /**
     * Check if batch has capacity
     */
    @GetMapping("/{batchId}/has-capacity")
    public ResponseEntity<Boolean> hasBatchCapacity(@PathVariable String batchId) {
        return ResponseEntity.ok(batchService.hasBatchCapacity(batchId));
    }

    /**
     * Get available capacity in batch
     */
    @GetMapping("/{batchId}/available-capacity")
    public ResponseEntity<Integer> getAvailableCapacity(@PathVariable String batchId) {
        return ResponseEntity.ok(batchService.getAvailableCapacity(batchId));
    }

}
