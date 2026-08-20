package com.example.SPT.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationCreateRequest {

    // Candidate Details

    @NotBlank(message = "Full name is required")
    @Size(min = 3, max = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$",
            message = "Invalid mobile number")
    private String mobile;

    // Parent Details

    @NotBlank(message = "Father occupation is required")
    private String fatherOccupation;

    @NotBlank(message = "Father contact number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$",
            message = "Invalid father contact number")
    private String fatherContactNumber;

    @NotBlank(message = "Mother occupation is required")
    private String motherOccupation;

    @NotBlank(message = "Mother contact number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$",
            message = "Invalid mother contact number")
    private String motherContactNumber;

    // Academic Details

    @NotNull(message = "Family income is required")
    @Positive(message = "Family income should be greater than zero")
    private Double familyIncome;

    @NotBlank(message = "Branch is required")
    private String branch;

    @NotBlank(message = "Year of study is required")
    private String yearOfStudy;

    @NotBlank(message = "College name is required")
    private String collegeName;

    // Program

    @NotNull(message = "ITEP selection is required")
    private Boolean interestedInITEP;

    private Boolean joinedWhatsappGroup;

    @Size(max = 500)
    private String additionalComments;

}