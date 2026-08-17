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
public class AssessmentResponse {

    private String id;

    private String trainerId;

    private String trainerName;

    private String batchId;

    private String title;

    private String subject;

    private String assessmentType;

    private String description;

    private String attachmentUrl;

    private String questionSource; // "MANUAL" or "PDF"

    private List<AssignmentQuestion> questions;

    private Integer totalMarks;

    private Integer durationInMinutes;

    private LocalDate assessmentDate;

    private String startTime;

    private String endTime;

    private LocalDate lastSubmissionDate;

    private String status;

}