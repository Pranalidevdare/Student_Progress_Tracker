package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.response.BatchResponse;
import com.example.SPT.enums.BatchStatus;

public interface BatchService {

    /**
     * Get all batches
     */
    List<BatchResponse> getAllBatches();

    /**
     * Get all active batches for assignment
     */
    List<BatchResponse> getActiveBatches();

    /**
     * Get batch by ID
     */
    BatchResponse getBatchById(String batchId);

    /**
     * Get batch by name
     */
    BatchResponse getBatchByName(String batchName);

    /**
     * Get batches by status
     */
    List<BatchResponse> getBatchesByStatus(BatchStatus status);

    /**
     * Get batches by course name
     */
    List<BatchResponse> getBatchesByCourse(String courseName);

    /**
     * Check if batch has available capacity
     */
    boolean hasBatchCapacity(String batchId);

    /**
     * Get available capacity in batch
     */
    int getAvailableCapacity(String batchId);

    /**
     * Get enrolled count in batch
     */
    int getEnrolledCount(String batchId);

}
