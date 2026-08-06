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
public class InterviewResponse {

    private String id;

    private String studentId;

    private String studentName;

    private String trainerId;

    private String trainerName;

    private String batchId;

    private LocalDate interviewDate;

    private String interviewType;

    private Integer technicalMarks;

    private Integer softSkillMarks;

    private Integer communicationMarks;

    private Integer problemSolvingMarks;

    private Integer behaviourMarks;

    private Integer totalMarks;

    private String remarks;

    private String status;

}