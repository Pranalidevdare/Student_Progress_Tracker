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
public class AssessmentSubmissionRequest {

    @NotBlank(message = "Assessment Id is required")
    private String assessmentId;

    @NotBlank(message = "Student Id is required")
    private String studentId;

    private String submissionFileUrl;

    private String submissionRemarks;
}