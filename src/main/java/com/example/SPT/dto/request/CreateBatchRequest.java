package com.example.SPT.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateBatchRequest {

    @NotBlank(message = "Batch name is required")
    private String batchName;

    @NotBlank(message = "Course name is required")
    private String courseName;

    @NotNull(message = "Technical Trainer Id is required")
    private String technicalTrainerId;

    @NotNull(message = "Soft Skills Trainer Id is required")
    private String softSkillsTrainerId;

    @NotNull(message = "Start Date is required")
    private LocalDate startDate;

    @NotNull(message = "End Date is required")
    private LocalDate endDate;

    @Min(value = 1, message = "Capacity must be greater than 0")
    private Integer capacity;
}