package com.example.SPT.mapper;

import org.springframework.stereotype.Component;

import com.example.SPT.dto.response.InterviewResponse;
import com.example.SPT.entity.Interview;

@Component
public class InterviewMapper {

    public InterviewResponse toResponse(Interview interview) {

        if (interview == null) {
            return null;
        }

        return InterviewResponse.builder()
                .id(interview.getId())
                .studentId(interview.getStudentId())
                .studentName(interview.getStudentName())
                .trainerId(interview.getTrainerId())
                .trainerName(interview.getTrainerName())
                .batchId(interview.getBatchId())
                .interviewDate(interview.getInterviewDate())
                .interviewType(interview.getInterviewType())
                .technicalMarks(interview.getTechnicalMarks() == null ? 0.0 : interview.getTechnicalMarks())
                .softSkillMarks(interview.getSoftSkillMarks() == null ? 0.0 : interview.getSoftSkillMarks())
                .communicationMarks(interview.getCommunicationMarks() == null ? 0.0 : interview.getCommunicationMarks())
                .problemSolvingMarks(interview.getProblemSolvingMarks() == null ? 0.0 : interview.getProblemSolvingMarks())
                .behaviourMarks(interview.getBehaviourMarks() == null ? 0.0 : interview.getBehaviourMarks())
                .totalMarks(interview.getTotalMarks() == null ? 0.0 : interview.getTotalMarks())
                .remarks(interview.getRemarks())
                .status(interview.getStatus())
                .build();
    }
}