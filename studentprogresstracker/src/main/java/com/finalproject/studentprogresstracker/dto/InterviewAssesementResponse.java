package com.finalproject.studentprogresstracker.dto;

import lombok.Data;

@Data
public class InterviewAssesementResponse {

    private String assessmentId;

    private String candidateId;
    private String fullName;
    private String email;

    private Integer aptitudeTotal;
    private Integer softSkillTotal;
    private Integer overallScore;

    private String technicalStatus;
    private String finalStatus;
}