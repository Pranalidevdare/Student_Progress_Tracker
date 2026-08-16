package com.example.SPT.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.SPT.entity.AssignmentQuestion;
import com.example.SPT.entity.QuestionAnswer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSubmissionDetailResponse {

    private String submissionId;
    private String assignmentId;
    private String assignmentTitle;
    private String studentId;
    private String studentName;
    private String studentEmail;

    // Question Source & Answers
    private String questionSource;
    private List<AssignmentQuestion> questions;
    private List<QuestionAnswer> questionAnswers;
    private String submissionStatus; // DRAFT or SUBMITTED

    private String submissionFileUrl;
    private String submissionRemarks;
    private LocalDateTime submittedAt;

    // Evaluation Details
    private Integer obtainedMarks;
    private Integer maxMarks;
    private String trainerRemarks;
    private String status; // SUBMITTED, PENDING, LATE, NOT_SUBMITTED, EVALUATED, DRAFT
    private String evaluationStatus; // EVALUATED, PENDING_EVALUATION, NOT_SUBMITTED, DRAFT

    // Date & Due Info
    private LocalDate dueDate;
    private Long daysOverdue;
    private Boolean isOverdue;
}
