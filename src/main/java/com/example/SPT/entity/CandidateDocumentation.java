package com.example.SPT.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.example.SPT.enums.DocumentationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "candidate_documentations")
public class CandidateDocumentation {

    @Id
    private String id;

    // =========================================================
    // APPLICATION REFERENCE
    // =========================================================

    @Indexed(unique = true)
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

    /*
     * YES
     * NO
     * MAYBE
     */
    private String firstGraduate;

    /*
     * MARRIED
     * UNMARRIED
     */
    private String maritalStatus;


    // =========================================================
    // PART A — CURRENT MAILING ADDRESS
    // =========================================================

    private String mailingFullName;

    private String mailingAddress;

    private String mailingPincode;

    private String personalMobile;

    private String personalEmail;


    // =========================================================
    // PART B — GUARDIAN DETAILS
    // =========================================================

    private String guardianFullName;

    private String guardianAddress;

    private String guardianPincode;

    private String guardianMobile;

    private String guardianLandline;


    // =========================================================
    // PART A — SECONDARY SCHOOL (10TH)
    // =========================================================

    private String tenthSchoolName;

    private String tenthBoard;

    private Integer tenthPassingYear;

    private String tenthMarks;

    private Double tenthPercentage;


    // =========================================================
    // PART B — HIGHER SECONDARY (12TH)
    // =========================================================

    private String twelfthSchoolName;

    private String twelfthBoard;

    private Integer twelfthPassingYear;

    private String twelfthMarks;

    private Double twelfthPercentage;


    // =========================================================
    // PART C — GRADUATION
    // =========================================================

    private String graduationCollege;

    private String graduationDegree;

    private String graduationMarks;

    private Double graduationPercentage;

    private Integer graduationPassingYear;


    // =========================================================
    // PART D — POST GRADUATION
    // =========================================================

    private String postGraduationCollege;

    private String postGraduationDegree;

    private Integer postGraduationPassingYear;

    private String postGraduationMarks;

    private Double postGraduationPercentage;


    // =========================================================
    // UPLOADED DOCUMENT REFERENCES
    // =========================================================

    /*
     * These fields store the FILE PATH / FILE URL,
     * not the actual uploaded file.
     */

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
    // DOCUMENTATION STATUS
    // =========================================================

    @Builder.Default
    private DocumentationStatus status =
            DocumentationStatus.PENDING;

    private String adminRemarks;


    // =========================================================
    // AUDIT FIELDS
    // =========================================================

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private LocalDateTime createdAt =
            LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt =
            LocalDateTime.now();
}