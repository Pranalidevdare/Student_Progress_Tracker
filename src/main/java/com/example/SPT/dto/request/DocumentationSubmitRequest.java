package com.example.SPT.dto.request;

import java.time.LocalDate;

import org.springframework.web.multipart.MultipartFile;

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
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentationSubmitRequest {

    // =========================================================
    // APPLICATION
    // =========================================================

    @NotBlank(message = "Application ID is required")
    private String applicationId;


    // =========================================================
    // PERSONAL DETAILS
    // =========================================================

    @NotBlank(message = "Candidate name is required")
    private String candidateName;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotNull(message = "Age is required")
    @Positive(message = "Age must be greater than zero")
    private Integer age;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String otherGender;

    @NotBlank(message = "Father name is required")
    private String fatherName;

    @NotBlank(message = "Father occupation is required")
    private String fatherOccupation;

    @NotBlank(message = "Mother name is required")
    private String motherName;

    @NotBlank(message = "Mother occupation is required")
    private String motherOccupation;

    @NotBlank(message = "First graduate information is required")
    private String firstGraduate;

    @NotBlank(message = "Marital status is required")
    private String maritalStatus;


    // =========================================================
    // CURRENT MAILING ADDRESS
    // =========================================================

    @NotBlank(message = "Mailing full name is required")
    private String mailingFullName;

    @NotBlank(message = "Mailing address is required")
    private String mailingAddress;

    @NotBlank(message = "Mailing pincode is required")
    @Pattern(
        regexp = "^[1-9][0-9]{5}$",
        message = "Invalid mailing pincode"
    )
    private String mailingPincode;

    @NotBlank(message = "Personal mobile number is required")
    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Invalid personal mobile number"
    )
    private String personalMobile;

    @NotBlank(message = "Personal email is required")
    @Email(message = "Invalid personal email")
    private String personalEmail;


    // =========================================================
    // GUARDIAN DETAILS
    // =========================================================

    @NotBlank(message = "Guardian name is required")
    private String guardianFullName;

    @NotBlank(message = "Guardian address is required")
    private String guardianAddress;

    @NotBlank(message = "Guardian pincode is required")
    @Pattern(
        regexp = "^[1-9][0-9]{5}$",
        message = "Invalid guardian pincode"
    )
    private String guardianPincode;

    @NotBlank(message = "Guardian mobile number is required")
    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Invalid guardian mobile number"
    )
    private String guardianMobile;

    private String guardianLandline;


    // =========================================================
    // 10TH DETAILS
    // =========================================================

    @NotBlank(message = "10th school name is required")
    private String tenthSchoolName;

    @NotBlank(message = "10th board is required")
    private String tenthBoard;

    @NotNull(message = "10th passing year is required")
    private Integer tenthPassingYear;

    @NotBlank(message = "10th marks are required")
    private String tenthMarks;

    @NotNull(message = "10th percentage is required")
    private Double tenthPercentage;


    // =========================================================
    // 12TH DETAILS
    // =========================================================

    @NotBlank(message = "12th school name is required")
    private String twelfthSchoolName;

    @NotBlank(message = "12th board is required")
    private String twelfthBoard;

    @NotNull(message = "12th passing year is required")
    private Integer twelfthPassingYear;

    @NotBlank(message = "12th marks are required")
    private String twelfthMarks;

    @NotNull(message = "12th percentage is required")
    private Double twelfthPercentage;


    // =========================================================
    // GRADUATION DETAILS
    // =========================================================

    @NotBlank(message = "Graduation college is required")
    private String graduationCollege;

    @NotBlank(message = "Graduation degree is required")
    private String graduationDegree;

    @NotBlank(message = "Graduation marks are required")
    private String graduationMarks;

    @NotNull(message = "Graduation percentage is required")
    private Double graduationPercentage;

    private Integer graduationPassingYear;


    // =========================================================
    // POST-GRADUATION DETAILS — OPTIONAL
    // =========================================================

    private String postGraduationCollege;

    private String postGraduationDegree;

    private Integer postGraduationPassingYear;

    private String postGraduationMarks;

    private Double postGraduationPercentage;


    // =========================================================
    // DOCUMENT UPLOADS
    // =========================================================

    /*
     * Actual uploaded files.
     *
     * These are NOT stored directly in MongoDB.
     * The service will save the files and store their
     * paths/references in CandidateDocumentation.
     */

    @NotNull(message = "Passport photograph is required")
    private MultipartFile passportPhoto;

    @NotNull(message = "Aadhar document is required")
    private MultipartFile aadharDocument;

    @NotNull(message = "10th marksheet is required")
    private MultipartFile tenthMarksheet;

    @NotNull(message = "12th marksheet is required")
    private MultipartFile twelfthMarksheet;

    @NotNull(message = "Bachelor marksheet is required")
    private MultipartFile bachelorMarksheet;

    /*
     * Optional because Master's degree is optional.
     */
    private MultipartFile masterMarksheet;

    @NotNull(message = "Family income certificate is required")
    private MultipartFile familyIncomeCertificate;


    // =========================================================
    // DECLARATION
    // =========================================================

    @NotNull(message = "Declaration must be accepted")
    private Boolean declarationAccepted;
}