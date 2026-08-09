package com.finalproject.studentprogresstracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeQuestionResponse {

    private String id;

    private String question;

    private String optionA;

    private String optionB;

    private String optionC;

    private String optionD;

    private String category;

    private Integer marks;
}