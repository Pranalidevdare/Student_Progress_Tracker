package com.example.SPT.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionAnswer {

    private String questionId;
    private Integer questionNumber;
    private String questionText;
    private Integer maxMarks;
    private String answerText;
    private Integer marksObtained;
    private String feedback;
}
