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

    private double technicalMarks;

    private double softSkillMarks;

    private double communicationMarks;

    private double problemSolvingMarks;

    private double behaviourMarks;

    private double totalMarks;

    private String remarks;

    private String status;

}