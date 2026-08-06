package com.finalproject.studentprogresstracker.mapper;

import org.springframework.stereotype.Component;

import com.finalproject.studentprogresstracker.dto.response.AssignmentResponse;
import com.finalproject.studentprogresstracker.entity.Assignment;

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
                .totalMarks(assignment.getTotalMarks())
                .assignedDate(assignment.getAssignedDate())
                .dueDate(assignment.getDueDate())
                .attachmentUrl(assignment.getAttachmentUrl())
                .status(assignment.getStatus())
                .build();
    }
}