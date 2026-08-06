package com.finalproject.studentprogresstracker.mapper;

import org.springframework.stereotype.Component;

import com.finalproject.studentprogresstracker.dto.response.InterviewResponse;
import com.finalproject.studentprogresstracker.entity.Interview;

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
                .technicalMarks(interview.getTechnicalMarks())
                .softSkillMarks(interview.getSoftSkillMarks())
                .communicationMarks(interview.getCommunicationMarks())
                .problemSolvingMarks(interview.getProblemSolvingMarks())
                .behaviourMarks(interview.getBehaviourMarks())
                .totalMarks(interview.getTotalMarks())
                .remarks(interview.getRemarks())
                .status(interview.getStatus())
                .build();
    }
}