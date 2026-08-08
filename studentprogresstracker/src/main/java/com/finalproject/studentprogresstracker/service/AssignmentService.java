package com.finalproject.studentprogresstracker.service;

import java.util.List;

import com.finalproject.studentprogresstracker.dto.request.AssignmentRequest;
import com.finalproject.studentprogresstracker.dto.request.AssignmentSubmissionRequest;
import com.finalproject.studentprogresstracker.dto.response.AssignmentResponse;

public interface AssignmentService {

    AssignmentResponse createAssignment(AssignmentRequest request);

    AssignmentResponse updateAssignment(String id, AssignmentRequest request);

    void deleteAssignment(String id);

    List<AssignmentResponse> getAssignmentsByBatch(String batchId);

    void submitAssignment(AssignmentSubmissionRequest request);

}