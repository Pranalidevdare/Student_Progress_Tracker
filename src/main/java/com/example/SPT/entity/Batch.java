package com.example.SPT.entity;


import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import com.example.SPT.enums.BatchStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "batches")
public class Batch {

    @Id
    private String id;

    private String batchName;

    private String courseName;

    private String technicalTrainerId;

    private String softSkillsTrainerId;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer capacity;

    private BatchStatus status;


    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}