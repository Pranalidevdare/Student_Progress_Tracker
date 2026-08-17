package com.example.SPT.dto.response;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerResponse {

    private String id;

    private String firstName;

    private String lastName;

    private String email;

    private String mobile;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    private String gender;

    private String employeeId;

    private String specialization;

    private String qualification;

    private Integer experience;

    private String batchId;

    private String batchName;

    private String profileImage;

    private Boolean active;

}