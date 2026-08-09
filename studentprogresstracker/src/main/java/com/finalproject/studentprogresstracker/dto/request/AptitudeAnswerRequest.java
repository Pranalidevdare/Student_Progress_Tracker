package com.finalproject.studentprogresstracker.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeAnswerRequest {

    private String questionId;

    private String selectedAnswer;
}