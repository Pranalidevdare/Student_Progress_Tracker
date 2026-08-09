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
@Document(collection = "attendance")
public class Attendance {

    @Id
    private String id;

    // Student Details
    private String studentId;
    private String studentName;

    // Trainer Details
    private String trainerId;
    private String trainerName;

    // Batch Information
    private String batchId;

    // Attendance Information
    private LocalDate attendanceDate;

    /**
     * PRESENT
     * ABSENT
     * LEAVE
     */
    private String status;

    // Optional remarks
    private String remarks;

    // Audit Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}