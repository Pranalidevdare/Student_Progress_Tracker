package com.finalproject.studentprogresstracker.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating student profile.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStudentProfileRequestDto {

    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Phone number must be a valid 10-digit Indian mobile number"
    )
    private String phone;

    @Size(max = 250, message = "Address cannot exceed 250 characters")
    private String address;

    private String profilePicture;
}