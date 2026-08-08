package com.finalproject.studentprogresstracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopperResponse {

    private Integer rank;

    private String studentId;

    private String studentName;

    private String batchId;

    private Double overallPercentage;

    private String performanceStatus;
}