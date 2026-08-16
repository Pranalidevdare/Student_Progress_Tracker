package com.example.SPT.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentQuestion {

    private String questionId;
    private Integer questionNumber;
    private String questionText;
    private Integer maxMarks;
    private String questionType; // e.g. "DESCRIPTIVE"
}
