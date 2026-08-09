package com.example.SPT.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSubmissionRequest {

    @NotBlank(message = "Assignment Id is required")
    private String assignmentId;

    @NotBlank(message = "Student Id is required")
    private String studentId;

    @NotBlank(message = "Submission File URL is required")
    private String submissionFileUrl;

    private String submissionRemarks;
}