package com.finalproject.studentprogresstracker.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestResponse {

    private String testId;

    private String trainerId;

    private String batchId;

    private String testTitle;

    private LocalDate testDate;

    private int duration;

    private int totalMarks;

}