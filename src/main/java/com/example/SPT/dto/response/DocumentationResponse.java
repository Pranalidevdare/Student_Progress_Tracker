package com.example.SPT.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.SPT.enums.DocumentationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentationResponse {

    // =========================================================
    // DOCUMENTATION
    // =========================================================

    private String id;

    private String applicationId;

    private String applicationNumber;


    // =========================================================
    // PERSONAL DETAILS
    // =========================================================

    private String candidateName;

    private LocalDate dateOfBirth;

    private Integer age;

    private String gender;

    private String otherGender;

    private String fatherName;

    private String fatherOccupation;

    private String motherName;

    private String motherOccupation;

    private String firstGraduate;

    private String maritalStatus;


    // =========================================================
    // CURRENT MAILING ADDRESS
    // =========================================================

    private String mailingFullName;

    private String mailingAddress;

    private String mailingPincode;

    private String personalMobile;

    private String personalEmail;


    // =========================================================
    // GUARDIAN DETAILS
    // =========================================================

    private String guardianFullName;

    private String guardianAddress;

    private String guardianPincode;

    private String guardianMobile;

    private String guardianLandline;


    // =========================================================
    // 10TH DETAILS
    // =========================================================

    private String tenthSchoolName;

    private String tenthBoard;

    private Integer tenthPassingYear;

    private String tenthMarks;

    private Double tenthPercentage;


    // =========================================================
    // 12TH DETAILS
    // =========================================================

    private String twelfthSchoolName;

    private String twelfthBoard;

    private Integer twelfthPassingYear;

    private String twelfthMarks;

    private Double twelfthPercentage;


    // =========================================================
    // GRADUATION DETAILS
    // =========================================================

    private String graduationCollege;

    private String graduationDegree;

    private String graduationMarks;

    private Double graduationPercentage;

    private Integer graduationPassingYear;


    // =========================================================
    // POST-GRADUATION DETAILS
    // =========================================================

    private String postGraduationCollege;

    private String postGraduationDegree;

    private Integer postGraduationPassingYear;

    private String postGraduationMarks;

    private Double postGraduationPercentage;


    // =========================================================
    // DOCUMENT REFERENCES
    // =========================================================

    private String passportPhoto;

    private String aadharDocument;

    private String tenthMarksheet;

    private String twelfthMarksheet;

    private String bachelorMarksheet;

    private String masterMarksheet;

    private String familyIncomeCertificate;


    // =========================================================
    // DECLARATION
    // =========================================================

    private Boolean declarationAccepted;


    // =========================================================
    // STATUS
    // =========================================================

    private DocumentationStatus status;

    private String adminRemarks;


    // =========================================================
    // AUDIT
    // =========================================================

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}