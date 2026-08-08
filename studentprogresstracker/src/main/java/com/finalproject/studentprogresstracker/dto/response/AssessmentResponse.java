package com.finalproject.studentprogresstracker.dto.response;

import java.time.LocalDate;

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

    private String description;

    private Integer totalMarks;

    private Integer durationInMinutes;

    private LocalDate assessmentDate;

    private LocalDate lastSubmissionDate;

    private String status;

}