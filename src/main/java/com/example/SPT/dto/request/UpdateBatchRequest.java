package com.example.SPT.dto.request;

import java.time.LocalDate;

import com.example.SPT.enums.BatchStatus;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBatchRequest {

    @NotBlank(message = "Batch name is required")
    private String batchName;

    @NotBlank(message = "Course name is required")
    private String courseName;

    @NotBlank(message = "Technical Trainer is required")
    private String technicalTrainerId;

    @NotBlank(message = "Soft Skills Trainer is required")
    private String softSkillsTrainerId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity should be greater than zero")
    private Integer capacity;

    @NotNull(message = "Batch status is required")
    private BatchStatus status;
}