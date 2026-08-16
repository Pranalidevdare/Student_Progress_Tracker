package com.example.SPT.dto.request;

import java.util.List;

import com.example.SPT.entity.QuestionAnswer;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationRequest {

    @Min(value = 0, message = "Marks cannot be negative")
    private Integer obtainedMarks;

    private String trainerRemarks;

    private List<QuestionAnswer> questionAnswers;
}
