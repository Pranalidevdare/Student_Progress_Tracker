package com.example.SPT.service.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.SPT.dto.response.BatchResponse;
import com.example.SPT.entity.Batch;
import com.example.SPT.enums.BatchStatus;
import com.example.SPT.exception.ResourceNotFoundException;
import com.example.SPT.mapper.BatchMapper;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.repository.StudentRepository;
import com.example.SPT.service.BatchService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class BatchServiceImpl implements BatchService {

    private final BatchRepository batchRepository;
    private final StudentRepository studentRepository;
    private final BatchMapper batchMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponse> getAllBatches() {
        List<Batch> batches = batchRepository.findAll();
        return batches.stream()
                .map(this::enrichBatchWithEnrollment)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponse> getActiveBatches() {
        List<Batch> batches = batchRepository.findByStatus(BatchStatus.ACTIVE);
        return batches.stream()
                .map(this::enrichBatchWithEnrollment)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BatchResponse getBatchById(String batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Batch not found with ID: " + batchId));
        return enrichBatchWithEnrollment(batch);
    }

    @Override
    @Transactional(readOnly = true)
    public BatchResponse getBatchByName(String batchName) {
        Batch batch = batchRepository.findByBatchName(batchName)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Batch not found with name: " + batchName));
        return enrichBatchWithEnrollment(batch);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponse> getBatchesByStatus(BatchStatus status) {
        List<Batch> batches = batchRepository.findByStatus(status);
        return batches.stream()
                .map(this::enrichBatchWithEnrollment)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BatchResponse> getBatchesByCourse(String courseName) {
        List<Batch> batches = batchRepository.findByCourseNameIgnoreCase(courseName);
        return batches.stream()
                .map(this::enrichBatchWithEnrollment)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasBatchCapacity(String batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Batch not found with ID: " + batchId));
        
        long enrolledCount = studentRepository.countByBatchId(batchId);
        return enrolledCount < batch.getCapacity();
    }

    @Override
    @Transactional(readOnly = true)
    public int getAvailableCapacity(String batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Batch not found with ID: " + batchId));
        
        long enrolledCount = studentRepository.countByBatchId(batchId);
        return Math.max(0, batch.getCapacity() - (int) enrolledCount);
    }

    @Override
    @Transactional(readOnly = true)
    public int getEnrolledCount(String batchId) {
        return (int) studentRepository.countByBatchId(batchId);
    }

    /**
     * Helper method to enrich batch response with enrollment information
     */
    private BatchResponse enrichBatchWithEnrollment(Batch batch) {
        long enrolledCount = studentRepository.countByBatchId(batch.getId());
        
        BatchResponse response = batchMapper.toResponse(batch);
        response.setEnrolledCount((int) enrolledCount);
        
        return response;
    }

}
