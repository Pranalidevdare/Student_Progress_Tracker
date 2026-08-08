package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.AssessmentRequest;
import com.example.SPT.dto.request.AssessmentSubmissionRequest;
import com.example.SPT.dto.response.AssessmentResponse;
import com.example.SPT.entity.AssessmentResult;
import com.example.SPT.entity.MonthlyAssessment;
import com.example.SPT.mapper.AssessmentMapper;
import com.example.SPT.repository.AssessmentResultRepository;
import com.example.SPT.repository.MonthlyAssessmentRepository;
import com.example.SPT.service.AssessmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssessmentServiceImpl implements AssessmentService {

    private final MonthlyAssessmentRepository assessmentRepository;

    private final AssessmentResultRepository assessmentResultRepository;

    private final AssessmentMapper assessmentMapper;

    @Override
    public AssessmentResponse createAssessment(AssessmentRequest request) {

        MonthlyAssessment assessment = MonthlyAssessment.builder()
                .trainerId(request.getTrainerId())
                .batchId(request.getBatchId())
                .title(request.getTitle())
                .subject(request.getSubject())
                .description(request.getDescription())
                .totalMarks(request.getTotalMarks())
                .durationInMinutes(request.getDurationInMinutes())
                .assessmentDate(request.getAssessmentDate())
                .lastSubmissionDate(request.getLastSubmissionDate())
                .status(request.getStatus())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        MonthlyAssessment savedAssessment =
                assessmentRepository.save(assessment);

        return assessmentMapper.toResponse(savedAssessment);
    }

    @Override
    public AssessmentResponse updateAssessment(String id,
                                               AssessmentRequest request) {

        MonthlyAssessment assessment =
                assessmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assessment not found with id : " + id));

        assessment.setTrainerId(request.getTrainerId());
        assessment.setBatchId(request.getBatchId());
        assessment.setTitle(request.getTitle());
        assessment.setSubject(request.getSubject());
        assessment.setDescription(request.getDescription());
        assessment.setTotalMarks(request.getTotalMarks());
        assessment.setDurationInMinutes(request.getDurationInMinutes());
        assessment.setAssessmentDate(request.getAssessmentDate());
        assessment.setLastSubmissionDate(request.getLastSubmissionDate());
        assessment.setStatus(request.getStatus());
        assessment.setUpdatedAt(LocalDateTime.now());

        MonthlyAssessment updatedAssessment =
                assessmentRepository.save(assessment);

        return assessmentMapper.toResponse(updatedAssessment);
    }

    @Override
    public void deleteAssessment(String id) {

        MonthlyAssessment assessment =
                assessmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assessment not found with id : " + id));

        assessmentRepository.delete(assessment);
    }

    @Override
    public List<AssessmentResponse> getAssessmentsByBatch(String batchId) {

        return assessmentRepository.findByBatchId(batchId)
                .stream()
                .map(assessmentMapper::toResponse)
                .collect(Collectors.toList());

    }

    @Override
    public void submitAssessment(AssessmentSubmissionRequest request) {

        AssessmentResult result = AssessmentResult.builder()
                .assessmentId(request.getAssessmentId())
                .studentId(request.getStudentId())
                .submittedAt(LocalDateTime.now())
                .resultStatus("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        assessmentResultRepository.save(result);
    }

}