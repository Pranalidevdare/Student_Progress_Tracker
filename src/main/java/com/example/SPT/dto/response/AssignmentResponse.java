package com.example.SPT.dto.response;

import java.time.LocalDate;
import java.util.List;

import com.example.SPT.entity.AssignmentQuestion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {

    private String id;

    private String trainerId;

    private String trainerName;

    private String batchId;

    private String title;

    private String description;

    private String subject;

    private String questionSource;

    private List<AssignmentQuestion> questions;

    private Integer totalMarks;

    private LocalDate assignedDate;

    private LocalDate dueDate;

    private String attachmentUrl;

    private String status;

    private Integer totalStudents;
    private Integer submittedCount;
    private Integer pendingCount;
    private Integer evaluatedCount;
    private Integer pendingEvaluationCount;

}