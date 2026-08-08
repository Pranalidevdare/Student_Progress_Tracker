package com.finalproject.studentprogresstracker.dto.request;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentUpdateRequest {

    private String firstName;

    private String lastName;

    private String mobile;

    private LocalDate dateOfBirth;

    private String gender;

    private String collegeName;

    private String degree;

    private String branch;

    private Integer passingYear;

    private Double cgpa;

    private String profileImage;
}