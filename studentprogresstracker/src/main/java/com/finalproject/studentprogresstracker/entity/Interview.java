package com.finalproject.studentprogresstracker.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "interview_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    private String assessmentId;

    // Candidate Details (Auto-filled)
    private String candidateId;
    private String trainerId;

    private String interviewDate;
    private String reportingTime;

    private String fullName;
    private String email;
    private String mobileNumber;
    private String collegeName;
    private String degreeName;
    private Integer passingYear;
    private Double familyIncome;

    // Aptitude
    private Integer aptitude;
    private Integer mathematics;
    private Integer reasoning;
    private Integer computerKnowledge;
    private Integer aptitudeTotal;

    // Technical
    private String technicalPanelist;
    private String technicalAssessment;
    private String stability;
    private String technicalRemarks;
    private String technicalStatus;

    // Soft Skills
    private String softSkillPanelist;
    private Integer warmUp;
    private Integer speaking;
    private Integer listening;
    private Integer grammar;
    private Integer vocabulary;
    private Integer guidedSpeaking;
    private Integer softSkillTotal;

    // Final Result
    private Integer overallScore;
    private String finalStatus;
    private String remarks;
}