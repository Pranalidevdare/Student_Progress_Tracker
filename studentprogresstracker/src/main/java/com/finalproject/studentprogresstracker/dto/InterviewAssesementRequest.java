package com.finalproject.studentprogresstracker.dto;

import lombok.Data;

@Data
public class InterviewAssesementRequest {

    private Integer aptitude;
    private Integer mathematics;
    private Integer reasoning;
    private Integer computerKnowledge;

    private String technicalPanelist;
    private String technicalAssessment;
    private String stability;
    private String technicalRemarks;
    private String technicalStatus;

    private String softSkillPanelist;
    private Integer warmUp;
    private Integer speaking;
    private Integer listening;
    private Integer grammar;
    private Integer vocabulary;
    private Integer guidedSpeaking;

    private String remarks;
}