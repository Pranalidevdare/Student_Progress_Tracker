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
public class FeedbackResponse {

    private String feedbackId;

    private String trainerId;

    private String studentId;

    private int rating;

    private String feedback;

    private LocalDate feedbackDate;

}