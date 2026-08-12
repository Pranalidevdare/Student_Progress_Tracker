package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.AssessmentRequest;
import com.example.SPT.dto.request.AssessmentSubmissionRequest;
import com.example.SPT.dto.response.AssessmentResponse;

public interface AssessmentService {

    AssessmentResponse createAssessment(AssessmentRequest request);

    AssessmentResponse updateAssessment(String id, AssessmentRequest request);

    void deleteAssessment(String id);

    List<AssessmentResponse> getAssessmentsByBatch(String batchId);

    void submitAssessment(AssessmentSubmissionRequest request);

}