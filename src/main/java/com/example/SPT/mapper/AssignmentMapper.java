package com.example.SPT.mapper;

import org.springframework.stereotype.Component;

import com.example.SPT.dto.request.AssignmentRequest;
import com.example.SPT.dto.response.AssignmentResponse;
import com.example.SPT.entity.Assignment;

@Component
public class AssignmentMapper {

    public AssignmentResponse toResponse(Assignment assignment) {

        if (assignment == null) {
            return null;
        }

        return AssignmentResponse.builder()
                .id(assignment.getId())
                .trainerId(assignment.getTrainerId())
                .trainerName(assignment.getTrainerName())
                .batchId(assignment.getBatchId())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .subject(assignment.getSubject())
                .questionSource(assignment.getQuestionSource() != null ? assignment.getQuestionSource() : (assignment.getAttachmentUrl() != null && !assignment.getAttachmentUrl().isEmpty() ? "PDF" : "MANUAL"))
                .questions(assignment.getQuestions())
                .totalMarks(assignment.getTotalMarks())
                .assignedDate(assignment.getAssignedDate())
                .dueDate(assignment.getDueDate())
                .attachmentUrl(assignment.getAttachmentUrl())
                .status(assignment.getStatus())
                .build();
    }

    public Assignment toEntity(AssignmentRequest request) {
        if (request == null) {
            return null;
        }

        return Assignment.builder()
                .trainerId(request.getTrainerId())
                .batchId(request.getBatchId())
                .title(request.getTitle())
                .description(request.getDescription())
                .subject(request.getSubject())
                .questionSource(request.getQuestionSource())
                .questions(request.getQuestions())
                .totalMarks(request.getTotalMarks())
                .assignedDate(request.getAssignedDate())
                .dueDate(request.getDueDate())
                .attachmentUrl(request.getAttachmentUrl())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();
    }
}