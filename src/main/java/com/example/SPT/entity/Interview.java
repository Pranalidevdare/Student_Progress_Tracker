package com.example.SPT.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "interviews")
public class Interview {

    @Id
    private String id;

    // Student Details
    private String studentId;
    private String studentName;

    // Trainer Details
    private String trainerId;
    private String trainerName;

    // Batch Details
    private String batchId;

    // Interview Information
    private LocalDate interviewDate;

    private String interviewType;

    // Technical Evaluation
    private Integer technicalMarks;

    // Soft Skill Evaluation
    private Integer softSkillMarks;

    // Communication Skills
    private Integer communicationMarks;

    // Problem Solving
    private Integer problemSolvingMarks;

    // Behaviour
    private Integer behaviourMarks;

    // Total
    private Integer totalMarks;

    // Remarks
    private String remarks;

    /**
     * SCHEDULED
     * COMPLETED
     * SELECTED
     * REJECTED
     */
    private String status;

    // Audit Fields
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}