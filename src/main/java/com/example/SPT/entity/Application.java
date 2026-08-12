package com.example.SPT.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.example.SPT.enums.ApplicationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "applications")
public class Application {

    @Id
    private String id;

    // Application Details
    
    @Indexed(unique = true)
    private String userId;

    @Indexed(unique = true)
    private String applicationNumber;

    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    // Candidate Details

    private String fullName;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true)
    private String mobile;

    // Parent Details

    private String fatherOccupation;

    private String fatherContactNumber;

    private String motherOccupation;

    private String motherContactNumber;

    // Academic Details

    private Double familyIncome;

    private String branch;

    private String yearOfStudy;

    private String collegeName;

    // Program Details

    private Boolean interestedInITEP;

    private Boolean joinedWhatsappGroup;

    private String additionalComments;

    // Selection Process

    private String aptitudeRemarks;

    private String technicalInterviewRemarks;

    private String hrInterviewRemarks;

    private String adminRemarks;

    // Audit Fields

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

}