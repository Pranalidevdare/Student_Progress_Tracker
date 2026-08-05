package com.finalproject.studentprogresstracker.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainerResponse {

    private String trainerId;

    private String trainerName;

    private String email;

    private String mobileNumber;

    private String department;

    private String specialization;

    private int experience;

    private String qualification;

    private LocalDate joiningDate;

    private String status;
}