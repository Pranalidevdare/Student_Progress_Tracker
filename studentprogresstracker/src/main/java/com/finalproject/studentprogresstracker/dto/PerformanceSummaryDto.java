package com.finalproject.studentprogresstracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Performance summary DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceSummaryDto {

    private Double technicalMarks;

    private Double aptitudeMarks;

    private Double average;

    private Integer rank;

    private String remarks;
}