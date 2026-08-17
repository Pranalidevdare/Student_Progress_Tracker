package com.example.SPT.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.example.SPT.dto.request.AssessmentRequest;
import com.example.SPT.dto.request.AssessmentSubmissionRequest;
import com.example.SPT.dto.response.AssessmentResponse;
import com.example.SPT.dto.response.AssessmentStatsResponse;
import com.example.SPT.dto.response.AssessmentStudentDetailResponse;
import com.example.SPT.entity.AssessmentResult;

public interface AssessmentService {

    AssessmentResponse createAssessment(AssessmentRequest request);

    AssessmentResponse updateAssessment(String id, AssessmentRequest request);

    void deleteAssessment(String id);

    List<AssessmentResponse> getAssessmentsByBatch(String batchId);

    void submitAssessment(AssessmentSubmissionRequest request);

    String uploadAssessmentDocument(MultipartFile file);

    AssessmentResult evaluateSubmission(String submissionId, Integer marks, String remarks);

    AssessmentResponse getAssessmentById(String id);

    AssessmentStatsResponse getAssessmentStatisticsById(String assessmentId, String batchId);

    List<AssessmentStudentDetailResponse> getAssessmentStudentDetails(String assessmentId, String batchId);

    AssessmentStudentDetailResponse getStudentAnswers(String assessmentId, String studentId);

    AssessmentStudentDetailResponse getEvaluationDetails(String submissionId);
}