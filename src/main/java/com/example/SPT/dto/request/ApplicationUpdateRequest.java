package com.example.SPT.dto.request;

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
public class ApplicationUpdateRequest {

    @NotBlank
    @Size(min = 3, max = 100)
    private String fullName;

    @NotBlank
    private String fatherOccupation;

    @Pattern(regexp = "^[6-9]\\d{9}$")
    private String fatherContactNumber;

    @NotBlank
    private String motherOccupation;

    @Pattern(regexp = "^[6-9]\\d{9}$")
    private String motherContactNumber;

    @NotNull
    @Positive
    private Double familyIncome;

    @NotBlank
    private String branch;

    @NotBlank
    private String yearOfStudy;

    @NotBlank
    private String collegeName;

    @NotNull
    private Boolean interestedInITEP;

    @NotNull
    private Boolean joinedWhatsappGroup;

    @Size(max = 500)
    private String additionalComments;

}