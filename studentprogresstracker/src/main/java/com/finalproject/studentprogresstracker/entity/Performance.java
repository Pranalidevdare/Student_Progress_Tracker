package com.finalproject.studentprogresstracker.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "performance")
public class Performance {

    @Id
    private String performanceId;

    private String trainerId;

    private String studentId;

    private double attendancePercentage;

    private double assignmentMarks;

    private double testMarks;

    private String overallPerformance;

    private String remarks;
}