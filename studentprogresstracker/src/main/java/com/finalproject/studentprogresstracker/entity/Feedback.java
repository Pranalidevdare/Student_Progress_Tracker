package com.finalproject.studentprogresstracker.entity;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "feedback")
public class Feedback {

    @Id
    private String feedbackId;

    private String trainerId;

    private String studentId;

    private int rating;

    private String feedback;

    private LocalDate feedbackDate;
}