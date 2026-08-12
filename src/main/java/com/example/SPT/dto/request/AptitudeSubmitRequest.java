package com.example.SPT.dto.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeSubmitRequest {

    private String candidateId;

    private String assessmentId;

    private List<AptitudeAnswerRequest> answers;
}