package com.finalproject.studentprogresstracker.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.finalproject.studentprogresstracker.enums.PerformanceStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "performance")
public class Performance {

    @Id
    private String id;

    // Student Details
    private String studentId;
    private String studentName;

    // Batch Details
    private String batchId;

    // Performance Metrics
    private Double attendancePercentage;
    private Double assignmentPercentage;
    private Double assessmentPercentage;
    private Double interviewPercentage;

    // Overall Performance
    private Double overallPercentage;
    private Integer rank;

    /**
     * EXCELLENT
     * GOOD
     * AVERAGE
     * NEEDS_IMPROVEMENT
     */
    private PerformanceStatus performanceStatus;

    // Trainer Feedback
    private String remarks;

    // Audit Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}