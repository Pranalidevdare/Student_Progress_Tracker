package com.finalproject.studentprogresstracker.entity;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "trainers")
public class Trainer {

    @Id
    private String trainerId;

    @NotBlank(message = "Trainer name is required")
    private String trainerName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Enter a valid 10-digit mobile number"
    )
    private String mobileNumber;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @Positive(message = "Experience must be greater than zero")
    private int experience;

    @NotBlank(message = "Qualification is required")
    private String qualification;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    private String status; // ACTIVE / INACTIVE

}