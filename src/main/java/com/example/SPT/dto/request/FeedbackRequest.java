package com.example.SPT.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequest {

    @NotBlank(message = "Student Id is required")
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

    private String trainerType; // TECHNICAL or SOFT_SKILL
    private String direction;   // STUDENT_TO_TRAINER, TRAINER_TO_STUDENT, or QUERY
    private String strengths;
    private String areasForImprovement;
    private String trainerRemarks;
    private String sessionTitle;

}