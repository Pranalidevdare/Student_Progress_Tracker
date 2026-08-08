package com.finalproject.studentprogresstracker.service;

import java.util.List;

import com.finalproject.studentprogresstracker.dto.request.AssessmentRequest;
import com.finalproject.studentprogresstracker.dto.request.AssessmentSubmissionRequest;
import com.finalproject.studentprogresstracker.dto.response.AssessmentResponse;

public interface AssessmentService {

    AssessmentResponse createAssessment(AssessmentRequest request);

    AssessmentResponse updateAssessment(String id, AssessmentRequest request);

    void deleteAssessment(String id);

    List<AssessmentResponse> getAssessmentsByBatch(String batchId);

    void submitAssessment(AssessmentSubmissionRequest request);

}