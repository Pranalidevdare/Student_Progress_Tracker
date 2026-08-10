package com.example.SPT.mapper;

import org.springframework.stereotype.Component;

import com.example.SPT.dto.response.AptitudeQuestionResponse;
import com.example.SPT.entity.AptitudeQuestion;

@Component
public class AptitudeQuestionMapper {

    public AptitudeQuestionResponse toResponse(
            AptitudeQuestion question) {

        if (question == null) {
            return null;
        }

        return AptitudeQuestionResponse.builder()
                .id(question.getId())
                .question(question.getQuestion())
                .optionA(question.getOptionA())
                .optionB(question.getOptionB())
                .optionC(question.getOptionC())
                .optionD(question.getOptionD())
                .category(question.getCategory())
                .marks(question.getMarks())
                .build();
    }
}