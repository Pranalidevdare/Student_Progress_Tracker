package com.example.SPT.dto.response;

import java.time.LocalDate;

import com.example.SPT.entity.SelectionStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {

    private String id;
    private SelectionStatus selectionStatus;
    private String firstName;

    private String lastName;

    private String email;

    private String mobile;

    private LocalDate dateOfBirth;

    private String gender;

    private String collegeName;

    private String degree;

    private String branch;

    private Integer passingYear;

    private Double cgpa;

    private String batchId;

    private String profileImage;

    private Boolean active;

}