package com.finalproject.studentprogresstracker.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.dto.request.AssignmentRequest;
import com.finalproject.studentprogresstracker.dto.request.AssignmentSubmissionRequest;
import com.finalproject.studentprogresstracker.dto.response.AssignmentResponse;
import com.finalproject.studentprogresstracker.entity.Assignment;
import com.finalproject.studentprogresstracker.entity.AssignmentSubmission;
import com.finalproject.studentprogresstracker.mapper.AssignmentMapper;
import com.finalproject.studentprogresstracker.repository.AssignmentRepository;
import com.finalproject.studentprogresstracker.repository.AssignmentSubmissionRepository;
import com.finalproject.studentprogresstracker.service.AssignmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;

    private final AssignmentSubmissionRepository assignmentSubmissionRepository;

    private final AssignmentMapper assignmentMapper;

    @Override
    public AssignmentResponse createAssignment(AssignmentRequest request) {

        Assignment assignment = Assignment.builder()
                .trainerId(request.getTrainerId())
                .batchId(request.getBatchId())
                .title(request.getTitle())
                .description(request.getDescription())
                .subject(request.getSubject())
                .totalMarks(request.getTotalMarks())
                .assignedDate(request.getAssignedDate())
                .dueDate(request.getDueDate())
                .attachmentUrl(request.getAttachmentUrl())
                .status(request.getStatus())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Assignment savedAssignment = assignmentRepository.save(assignment);

        return assignmentMapper.toResponse(savedAssignment);
    }

    @Override
    public AssignmentResponse updateAssignment(String id, AssignmentRequest request) {

        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Assignment not found with id : " + id));

        assignment.setTrainerId(request.getTrainerId());
        assignment.setBatchId(request.getBatchId());
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setSubject(request.getSubject());
        assignment.setTotalMarks(request.getTotalMarks());
        assignment.setAssignedDate(request.getAssignedDate());
        assignment.setDueDate(request.getDueDate());
        assignment.setAttachmentUrl(request.getAttachmentUrl());
        assignment.setStatus(request.getStatus());
        assignment.setUpdatedAt(LocalDateTime.now());

        Assignment updatedAssignment = assignmentRepository.save(assignment);

        return assignmentMapper.toResponse(updatedAssignment);
    }

    @Override
    public void deleteAssignment(String id) {

        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Assignment not found with id : " + id));

        assignmentRepository.delete(assignment);
    }

    @Override
    public List<AssignmentResponse> getAssignmentsByBatch(String batchId) {

        return assignmentRepository.findByBatchId(batchId)
                .stream()
                .map(assignmentMapper::toResponse)
                .collect(Collectors.toList());

    }

    @Override
    public void submitAssignment(AssignmentSubmissionRequest request) {

        AssignmentSubmission submission = AssignmentSubmission.builder()
                .assignmentId(request.getAssignmentId())
                .studentId(request.getStudentId())
                .submissionFileUrl(request.getSubmissionFileUrl())
                .submissionRemarks(request.getSubmissionRemarks())
                .submittedAt(LocalDateTime.now())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        assignmentSubmissionRepository.save(submission);
    }

}