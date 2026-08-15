package com.example.SPT.dto.response;

import java.time.LocalDateTime;

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
    private Double overallRating;
    private String subject;
    private String comments;
    private String status;
    private String trainerResponse;

    private String trainerType;
    private String direction;
    private String strengths;
    private String areasForImprovement;
    private String trainerRemarks;
    private String sessionTitle;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}