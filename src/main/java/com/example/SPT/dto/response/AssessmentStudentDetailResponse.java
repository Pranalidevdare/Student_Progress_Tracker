package com.example.SPT.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentStudentDetailResponse {
    private String submissionId;
    private String assessmentId;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String attemptStatus; // ATTEMPTED, NOT_ATTEMPTED
    private LocalDateTime submittedAt;
    private String evaluationStatus; // EVALUATED, PENDING_EVALUATION, NOT_EVALUATED
    private Integer marksObtained;
    private Integer maxMarks;
    private Double percentage;
    private String resultStatus; // PASSED, FAILED, PENDING, NOT_EVALUATED
    private String studentAnswers;
    private String answerSheetUrl;
    private String trainerRemarks;
}
