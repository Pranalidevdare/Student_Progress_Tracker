package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.AssignmentRequest;
import com.example.SPT.dto.request.AssignmentSubmissionRequest;
import com.example.SPT.dto.response.AssignmentResponse;

public interface AssignmentService {

    AssignmentResponse createAssignment(AssignmentRequest request);

    AssignmentResponse updateAssignment(String id, AssignmentRequest request);

    void deleteAssignment(String id);

    List<AssignmentResponse> getAssignmentsByBatch(String batchId);

    void submitAssignment(AssignmentSubmissionRequest request);

}