package com.example.SPT.dto.response;

import java.time.LocalDate;

import com.example.SPT.enums.BatchStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BatchResponse {

    private String id;

    private String batchName;

    private String courseName;

    private String technicalTrainerId;

    private String technicalTrainerName;

    private String softSkillsTrainerId;

    private String softSkillsTrainerName;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer capacity;

    private Integer enrolledCount;

    private BatchStatus status;
}