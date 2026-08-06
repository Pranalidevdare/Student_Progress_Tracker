package com.finalproject.studentprogresstracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {

    private String id;

    private String studentId;

    private String studentName;

    private String trainerId;

    private String trainerName;

    private String batchId;

    private Integer rating;

    private String subject;

    private String comments;

    private String status;

    private String trainerResponse;

}