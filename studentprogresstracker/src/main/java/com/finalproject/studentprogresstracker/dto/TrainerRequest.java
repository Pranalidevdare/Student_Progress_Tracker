package com.finalproject.studentprogresstracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainerRequest {

    @NotBlank(message = "Trainer name is required")
    private String trainerName;

    @Email(message = "Invalid email")
    private String email;

    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be 10 digits")
    private String mobileNumber;

    @NotBlank(message = "Department is required")
    private String department;

    private String specialization;

    @Positive(message = "Experience must be greater than 0")
    private int experience;

    @NotBlank(message = "Qualification is required")
    private String qualification;
}