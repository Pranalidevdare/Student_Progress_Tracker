package com.finalproject.studentprogresstracker.mapper;

import org.springframework.stereotype.Component;

import com.finalproject.studentprogresstracker.dto.response.AptitudeResultResponse;
import com.finalproject.studentprogresstracker.entity.AptitudeResult;

@Component
public class AptitudeResultMapper {

    public AptitudeResultResponse toResponse(AptitudeResult result) {

        if (result == null) {
            return null;
        }

        return AptitudeResultResponse.builder()
                .id(result.getId())
                .candidateId(result.getCandidateId())
                .candidateName(result.getCandidateName())
                .assessmentId(result.getAssessmentId())
                .assessmentType(result.getAssessmentType())

                .totalQuestions(result.getTotalQuestions())
                .attemptedQuestions(result.getAttemptedQuestions())
                .correctAnswers(result.getCorrectAnswers())
                .wrongAnswers(result.getWrongAnswers())
                .unattemptedQuestions(result.getUnattemptedQuestions())

                .marksObtained(result.getMarksObtained())
                .totalMarks(result.getTotalMarks())
                .percentage(result.getPercentage())

                .status(result.getStatus())

                .startedAt(result.getStartedAt())
                .submittedAt(result.getSubmittedAt())
                .evaluatedAt(result.getEvaluatedAt())

                .build();
    }
}