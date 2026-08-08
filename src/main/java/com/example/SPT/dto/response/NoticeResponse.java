package com.example.SPT.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeResponse {

    private String id;

    // Notice Details
    private String title;

    private String description;

    private String category;

    private String priority;

    // Batch Details
    private String batchId;

    // Trainer Details
    private String trainerId;

    private String trainerName;

    // Notice Dates
    private LocalDate publishDate;

    private LocalDate expiryDate;

    // Status
    private Boolean active;

    // Audit Fields
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}