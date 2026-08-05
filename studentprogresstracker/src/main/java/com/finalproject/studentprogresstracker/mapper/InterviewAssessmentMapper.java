package com.finalproject.studentprogresstracker.mapper;

import com.finalproject.studentprogresstracker.dto.InterviewAssesementResponse;
import com.finalproject.studentprogresstracker.entity.Interview;
import org.springframework.stereotype.Component;

@Component
public class InterviewAssessmentMapper {

    public InterviewAssesementResponse toDto(Interview interview){

        InterviewAssesementResponse dto =
                new InterviewAssesementResponse();

        dto.setAssessmentId(interview.getAssessmentId());
        dto.setCandidateId(interview.getCandidateId());
        dto.setFullName(interview.getFullName());
        dto.setEmail(interview.getEmail());
        dto.setAptitudeTotal(interview.getAptitudeTotal());
        dto.setSoftSkillTotal(interview.getSoftSkillTotal());
        dto.setOverallScore(interview.getOverallScore());
        dto.setTechnicalStatus(interview.getTechnicalStatus());
        dto.setFinalStatus(interview.getFinalStatus());

        return dto;
    }
}