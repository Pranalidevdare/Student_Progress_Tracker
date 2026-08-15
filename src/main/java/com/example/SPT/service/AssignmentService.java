package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.AssignmentRequest;
import com.example.SPT.dto.request.AssignmentSubmissionRequest;
import com.example.SPT.dto.response.AssignmentResponse;
import com.example.SPT.dto.response.AssignmentSubmissionDetailResponse;
import com.example.SPT.dto.response.TrainerAssignmentStatsResponse;
import com.example.SPT.dto.response.TrainerResponse;
import com.example.SPT.entity.Batch;

public interface AssignmentService {

    AssignmentResponse createAssignment(AssignmentRequest request);

    AssignmentResponse updateAssignment(String id, AssignmentRequest request);

    void deleteAssignment(String id);

    List<AssignmentResponse> getAssignmentsByBatch(String batchId);

    void submitAssignment(AssignmentSubmissionRequest request);

    TrainerAssignmentStatsResponse getAssignmentStatistics(String batchId);

    List<AssignmentSubmissionDetailResponse> getAssignmentSubmissions(String assignmentId, String batchId);

    AssignmentSubmissionDetailResponse evaluateSubmission(String submissionId, com.example.SPT.dto.request.EvaluationRequest request, String trainerEmail);

    List<Batch> getAllBatches();

    TrainerResponse switchTrainerBatch(String trainerEmail, com.example.SPT.dto.request.TrainerBatchSwitchRequest request);

    AssignmentResponse getAssignmentById(String id);

    TrainerAssignmentStatsResponse getSingleAssignmentStatistics(String assignmentId, String batchId);

    AssignmentSubmissionDetailResponse getStudentAssignmentSubmission(String assignmentId, String studentId);
}