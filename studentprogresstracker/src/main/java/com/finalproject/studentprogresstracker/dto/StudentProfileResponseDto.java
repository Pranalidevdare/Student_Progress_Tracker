package com.finalproject.studentprogresstracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Student Profile.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileResponseDto {

    private String studentId;

    private String name;

    private String email;

    private String batch;

    private String phone;

    private String address;

    private String profilePicture;
}