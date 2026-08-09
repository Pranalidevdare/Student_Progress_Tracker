package com.example.SPT.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewRequest {

    @NotBlank(message = "Student Id is required")
    private String studentId;

    @NotBlank(message = "Trainer Id is required")
    private String trainerId;

    @NotBlank(message = "Batch Id is required")
    private String batchId;

    @NotNull(message = "Interview Date is required")
    private LocalDate interviewDate;

    private String interviewType;

    private Integer technicalMarks;

    private Integer softSkillMarks;

    private Integer communicationMarks;

    private Integer problemSolvingMarks;

    private Integer behaviourMarks;

   
    private String remarks;


}